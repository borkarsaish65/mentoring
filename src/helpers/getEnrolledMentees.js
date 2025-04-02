const sessionAttendeesQueries = require('@database/queries/sessionAttendees')
const menteeExtensionQueries = require('@database/queries/userExtension')
const userRequests = require('@requests/user')
const bppRequests = require('@requests/bpp')
const entityTypeService = require('@services/entity-type')
const { Parser } = require('@json2csv/plainjs')

/**
 * Retrieves enrolled mentees for a given session, including their details and optionally exporting the data as a CSV.
 *
 * @async
 * @function getEnrolledMentees
 * @param {string} sessionId - The unique identifier of the session.
 * @param {Object} [queryParams={}] - Query parameters to customize the response.
 * @param {boolean} [queryParams.csv=false] - Whether to return the data in CSV format.
 * @param {string} userID - The unique identifier of the requesting user.
 * @returns {Promise<string|Object[]>} - Returns a CSV string if `queryParams.csv` is `true`, otherwise an array of mentee details.
 * @throws {Error} - Throws an error if fetching or processing data fails.
 */
exports.getEnrolledMentees = async (sessionId, queryParams, userID) => {
	try {
		const mentees = await sessionAttendeesQueries.findAll({ session_id: sessionId })
		console.log('getEnrolledMentees:::::::::::::::::;', mentees)
		const menteeIds = mentees.map((mentee) => mentee.mentee_id)
		let menteeTypeMap = {}
		mentees.forEach((mentee) => {
			menteeTypeMap[mentee.mentee_id] = mentee.type
		})

		// Separate menteeIds by type
		const externalMenteeIds = menteeIds.filter((id) => menteeTypeMap[id] === 'EXTERNAL')
		const regularMenteeIds = menteeIds.filter((id) => menteeTypeMap[id] !== 'EXTERNAL')

		const options = {
			attributes: {
				exclude: [
					'rating',
					'stats',
					'tags',
					'configs',
					'visible_to_organizations',
					'external_session_visibility',
					'external_mentee_visibility',
					'experience',
					'mentee_visibility',
				],
			},
		}

		// Initialize arrays
		let regularEnrolledUsers = []
		let externalEnrolledUsers = []
		let regularAttendeesAccounts = []

		// Fetch regular user data
		if (regularMenteeIds.length > 0) {
			;[regularEnrolledUsers, regularAttendeesAccounts] = await Promise.all([
				menteeExtensionQueries.getUsersByUserIds(regularMenteeIds, options),
				userRequests.getUserDetailedList(regularMenteeIds).then((result) => result.result),
			])

			// Process entity types for regular users
			const uniqueOrgIds = [...new Set(regularEnrolledUsers.map((user) => user.organization_id))]
			regularEnrolledUsers = await entityTypeService.processEntityTypesToAddValueLabels(
				regularEnrolledUsers,
				uniqueOrgIds,
				[await menteeExtensionQueries.getModelName()],
				'organization_id'
			)

			// Merge arrays for regular users
			regularEnrolledUsers = regularEnrolledUsers.map((user) => {
				const matchingUserDetails = regularAttendeesAccounts.find((details) => details.user_id === user.user_id)
				return matchingUserDetails ? { ...user, ...matchingUserDetails } : user
			})

			// Add type property to regular users
			regularEnrolledUsers.forEach((user) => {
				user.type = menteeTypeMap[user.user_id]
			})
		}

		// Fetch external user data
		if (externalMenteeIds.length > 0) {
			externalEnrolledUsers = await bppRequests.getUsers({ userIds: externalMenteeIds })

			// Add type and ensure user_id consistency for external users
			externalEnrolledUsers = externalEnrolledUsers.map((user) => {
				user.type = 'EXTERNAL'
				user.user_id = user.id
				return user
			})
		}

		// Combine users from both sources
		const mergedUserArray = [...regularEnrolledUsers, ...externalEnrolledUsers]

		const CSVFields = [
			{ label: 'No.', value: 'index_number' },
			{ label: 'Name', value: 'name' },
			{ label: 'Designation', value: 'designation' },
			{ label: 'Organization', value: 'organization' },
			{ label: 'E-mail ID', value: 'email' },
			{ label: 'Enrollment Type', value: 'type' },
		]

		const parser = new Parser({
			fields: CSVFields,
			header: true,
			includeEmptyRows: true,
			defaultValue: null,
		})

		// Return an empty CSV/response if list is empty
		if (mergedUserArray.length === 0) {
			return queryParams?.csv === 'true' ? parser.parse() : []
		}

		if (queryParams?.csv === 'true') {
			const csv = parser.parse(
				mergedUserArray.map((user, index) => ({
					index_number: index + 1,
					name: user.name,
					designation: user.designation
						? Array.isArray(user.designation)
							? user.designation.map((designation) => designation.label).join(', ')
							: user.designation
						: '',
					email: user.email,
					type: user.type,
					organization: user.organization?.name || '',
				}))
			)
			return csv
		}

		const propertiesToDelete = [
			'user_id',
			'organization_id',
			'meta',
			'email_verified',
			'gender',
			'location',
			'about',
			'share_link',
			'status',
			'last_logged_in_at',
			'has_accepted_terms_and_conditions',
			'languages',
			'preferred_language',
			'custom_entity_text',
		]

		const cleanedAttendeesAccounts = mergedUserArray.map((user, index) => {
			user.id = user.user_id
			propertiesToDelete.forEach((property) => {
				if (user.hasOwnProperty(property)) {
					delete user[property]
				}
			})
			user.index_number = index + 1
			return user
		})

		return cleanedAttendeesAccounts
	} catch (error) {
		throw error
	}
}
