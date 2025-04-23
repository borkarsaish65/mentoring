const connectionQueries = require('@database/queries/connection')
const sessionRequestQueries = require('@database/queries/requestSessions')
const moment = require('moment-timezone')
const userExtensionQueries = require('@database/queries/userExtension')
const common = require('@constants/common')
const responses = require('@helpers/responses')
const httpStatusCode = require('@generics/http-status')
const notificationQueries = require('@database/queries/notificationTemplate')
const entityTypeService = require('@services/entity-type')
const userRequests = require('@requests/user')
const sessionService = require('@services/sessions')
const mentorExtensionQueries = require('@database/queries/mentorExtension')
const utils = require('@generics/utils')
const kafkaCommunication = require('@generics/kafka-communication')
const { getDefaultOrgId } = require('@helpers/getDefaultOrgId')
const entityTypeQueries = require('@database/queries/entityType')
const { Op } = require('sequelize')
const { removeDefaultOrgEntityTypes } = require('@generics/utils')
const menteeServices = require('@services/mentees')
const mentorService = require('@services/mentors')

module.exports = class requestSessionsHelper {
	static async checkConnectionRequestExists(userId, targetUserId) {
		const connectionRequest = await connectionQueries.findOneRequest(userId, targetUserId)
		if (!connectionRequest) {
			return false
		}
		return connectionRequest
	}

	static async checkSessionRequestExists(userId, targetUserId) {
		const findSessionRequest = await sessionRequestQueries.findOneRequest(userId, targetUserId)
		if (!findSessionRequest) {
			return false
		}
		return findSessionRequest
	}

	/**
	 * Initiates a session request between two users.
	 * @param {Object} bodyData - The request body requesting session related information.
	 * @param {string} bodyData.friend_id - The ID of the target user.
	 * @param {string} userId - The ID of the user initiating the request.
	 * @returns {Promise<Object>} A success or failure response.
	 */

	static async create(bodyData, userId, orgId, skipValidation) {
		try {
			// Check if a connection already exists between the users
			const connectionExists = await connectionQueries.getConnection(userId, bodyData.friend_id)

			// If not connected, restrict mentee to a single pending request
			if (!connectionExists) {
				const pendingRequest = await sessionRequestQueries.checkPendingRequest(userId, bodyData.friend_id)
				if (pendingRequest.count > 0) {
					return responses.failureResponse({
						statusCode: httpStatusCode.bad_request,
						message: 'SESSION_REQUEST_PENDING',
					})
				}
			}

			const mentorUserExists = await userExtensionQueries.getMenteeExtension(bodyData.friend_id)
			if (!mentorUserExists) {
				return responses.failureResponse({
					statusCode: httpStatusCode.not_found,
					message: 'USER_NOT_FOUND',
				})
			}

			// Calculate duration of the session
			let duration = moment.duration(moment.unix(bodyData.end_date).diff(moment.unix(bodyData.start_date)))
			let elapsedMinutes = duration.asMinutes()

			// Based on session duration check recommended conditions
			if (elapsedMinutes < 30) {
				return responses.failureResponse({
					message: 'BELOW_MINIMUM_SESSION_TIME',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (elapsedMinutes > 1440) {
				return responses.failureResponse({
					message: 'EXCEEDED_MAXIMUM_SESSION_TIME',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// Get default org id and entities
			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId)
				return responses.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})

			const requestSessionModelName = await sessionRequestQueries.getModelName()
			const entityTypes = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [orgId, defaultOrgId],
				},
				model_names: { [Op.contains]: [requestSessionModelName] },
			})

			const validationData = removeDefaultOrgEntityTypes(entityTypes, orgId)
			let res = utils.validateInput(bodyData, validationData, requestSessionModelName, skipValidation)
			if (!res.success) {
				return responses.failureResponse({
					message: 'REQUEST_SESSION_CREATION_FAILED',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: res.errors,
				})
			}

			let requestSessionModel = await sessionRequestQueries.getColumns()
			bodyData = utils.restructureBody(bodyData, validationData, requestSessionModel)

			// Create a new session request
			const SessionRequestResult = await sessionRequestQueries.addSessionRequest(
				userId,
				bodyData.friend_id,
				bodyData.agenda,
				bodyData.start_date,
				bodyData.end_date,
				bodyData.title,
				bodyData.meta ? bodyData.meta : null
			)

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'SESSION_REQUEST_SENT_SUCCESSFULLY',
				result: SessionRequestResult,
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	/**
	 * Get a list of pending session requests for a user.
	 * @param {string} userId - The ID of the user.
	 * @param {number} pageNo - The page number for pagination.
	 * @param {number} pageSize - The number of records per page.
	 * @returns {Promise<Object>} The list of pending session requests.
	 */
	static async list(userId, pageNo, pageSize) {
		try {
			const pendingRequestSession = await sessionRequestQueries.getAllRequests(userId, pageNo, pageSize)

			if (pendingRequestSession.count == 0 || pendingRequestSession.rows.length == 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'SESSION_REQUESTS_LIST',
					result: {
						data: [],
						count: pendingRequestSession.count,
					},
				})
			}

			// Map friend details by user IDs
			const friendIds = pendingRequestSession.rows.map((requestSession) => requestSession.friend_id)
			let friendDetails = await userExtensionQueries.getUsersByUserIds(friendIds, {
				attributes: [
					'name',
					'user_id',
					'mentee_visibility',
					'organization_id',
					'designation',
					'area_of_expertise',
					'education_qualification',
					'custom_entity_text',
					'meta',
					'experience',
					'is_mentor',
					'image',
				],
			})

			const userExtensionsModelName = await userExtensionQueries.getModelName()

			const uniqueOrgIds = [...new Set(friendDetails.map((obj) => obj.organization_id))]
			friendDetails = await entityTypeService.processEntityTypesToAddValueLabels(
				friendDetails,
				uniqueOrgIds,
				userExtensionsModelName,
				'organization_id'
			)

			const friendDetailsMap = friendDetails.reduce((acc, friend) => {
				acc[friend.user_id] = friend
				return acc
			}, {})

			let requestSessionWithDetails = pendingRequestSession.rows.map((requestSession) => {
				return {
					...requestSession,
					user_details: friendDetailsMap[requestSession.friend_id] || null,
				}
			})

			const userIds = requestSessionWithDetails.map((item) => item.friend_id)
			const userDetails = await userRequests.getListOfUserDetails(userIds, true)
			const userDetailsMap = new Map(userDetails.result.map((userDetail) => [String(userDetail.id), userDetail]))
			requestSessionWithDetails = requestSessionWithDetails.filter((requestSessionWithDetail) => {
				const user_id = String(requestSessionWithDetail.friend_id)

				if (userDetailsMap.has(user_id)) {
					const userDetail = userDetailsMap.get(user_id)
					requestSessionWithDetail.user_details.image = userDetail.image
					return true
				}
				return false
			})

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'SESSION_REQUESTS_LIST',
				result: { data: requestSessionWithDetails, count: pendingRequestSession.count },
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	/**
	 * Get a list of pending session requests for a user.
	 * @param {string} userId - The ID of the user.
	 * @param {number} pageNo - The page number for pagination.
	 * @param {number} pageSize - The number of records per page.
	 * @returns {Promise<Object>} The list of pending session requests.
	 */
	static async pendingList(userId, pageNo, pageSize) {
		try {
			const pendingRequestSession = await sessionRequestQueries.getpendingRequests(userId, pageNo, pageSize)

			if (pendingRequestSession.count == 0 || pendingRequestSession.rows.length == 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'SESSION_REQUESTS_LIST',
					result: {
						data: [],
						count: pendingRequestSession.count,
					},
				})
			}

			// Map friend details by user IDs
			const friendIds = pendingRequestSession.rows.map((requestSession) => requestSession.friend_id)
			let friendDetails = await userExtensionQueries.getUsersByUserIds(friendIds, {
				attributes: [
					'name',
					'user_id',
					'mentee_visibility',
					'organization_id',
					'designation',
					'area_of_expertise',
					'education_qualification',
					'custom_entity_text',
					'meta',
					'experience',
					'is_mentor',
					'image',
				],
			})

			const userExtensionsModelName = await userExtensionQueries.getModelName()

			const uniqueOrgIds = [...new Set(friendDetails.map((obj) => obj.organization_id))]
			friendDetails = await entityTypeService.processEntityTypesToAddValueLabels(
				friendDetails,
				uniqueOrgIds,
				userExtensionsModelName,
				'organization_id'
			)

			const friendDetailsMap = friendDetails.reduce((acc, friend) => {
				acc[friend.user_id] = friend
				return acc
			}, {})

			let requestSessionWithDetails = pendingRequestSession.rows.map((requestSession) => {
				return {
					...requestSession,
					user_details: friendDetailsMap[requestSession.friend_id] || null,
				}
			})

			const userIds = requestSessionWithDetails.map((item) => item.friend_id)
			const userDetails = await userRequests.getListOfUserDetails(userIds, true)
			const userDetailsMap = new Map(userDetails.result.map((userDetail) => [String(userDetail.id), userDetail]))
			requestSessionWithDetails = requestSessionWithDetails.filter((requestSessionWithDetail) => {
				const user_id = String(requestSessionWithDetail.friend_id)

				if (userDetailsMap.has(user_id)) {
					const userDetail = userDetailsMap.get(user_id)
					requestSessionWithDetail.user_details.image = userDetail.image
					return true
				}
				return false
			})

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'SESSION_REQUESTS_LIST',
				result: { data: requestSessionWithDetails, count: pendingRequestSession.count },
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	/**
	 * Accept a pending session request.
	 * @param {Object} bodyData - The body data containing the target user ID.
	 * @param {string} bodyData.user_id - The ID of the target user.
	 * @param {string} mentorUserId - The ID of the authenticated user.
	 * @param {string} organization_id - the ID of the user organization.
	 * @returns {Promise<Object>} A success response indicating the request was accepted.
	 */
	static async accept(bodyData, mentorUserId, orgId, isMentor, notifyUser) {
		try {
			const skipValidation = true
			const getRequestSessionDetails = await sessionRequestQueries.findOneRequest(mentorUserId, bodyData.user_id)
			console.log('getRequestSessionDetails.agenda', getRequestSessionDetails, typeof getRequestSessionDetails)
			Object.assign(bodyData, {
				type: common.SESSION_TYPE.PRIVATE,
				mentor_id: mentorUserId,
				mentees: [bodyData.user_id],
				description: getRequestSessionDetails.agenda,
				title: getRequestSessionDetails.title,
				start_date: getRequestSessionDetails.start_date,
				end_date: getRequestSessionDetails.end_date,
				meta: getRequestSessionDetails.meta ? getRequestSessionDetails.meta : null,
			})
			const sessionCreation = await sessionService.create(
				bodyData,
				mentorUserId,
				orgId,
				isMentor,
				notifyUser,
				skipValidation
			)

			// If the session creation fails, return the actual error message
			if (sessionCreation.statusCode != httpStatusCode.created) {
				return responses.failureResponse({
					statusCode: sessionCreation.statusCode || httpStatusCode.bad_request,
					message: sessionCreation.message || 'SESSION_CREATION_FAILED',
					data: sessionCreation.data || [],
				})
			}

			const connectionExists = await connectionQueries.getConnection(mentorUserId, bodyData.user_id)

			const approveSessionRequest = await sessionRequestQueries.approveRequest(
				mentorUserId,
				bodyData.user_id,
				getRequestSessionDetails.agenda,
				getRequestSessionDetails.start_date,
				getRequestSessionDetails.end_date,
				getRequestSessionDetails.title,
				sessionCreation.result.id
			)
			if (
				!approveSessionRequest.length ||
				approveSessionRequest[0]?.dataValues?.status !== common.CONNECTIONS_STATUS.ACCEPTED
			) {
				return responses.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'SESSION_APPROVAL_FAILED',
					data: [],
				})
			}

			if (approveSessionRequest[0]?.dataValues?.status == common.CONNECTIONS_STATUS.ACCEPTED) {
				const userExists = await userExtensionQueries.getMenteeExtension(bodyData.user_id)
				if (!userExists) {
					return responses.failureResponse({
						statusCode: httpStatusCode.not_found,
						message: 'USER_NOT_FOUND',
					})
				}

				const connectionRequest = await this.checkConnectionRequestExists(mentorUserId, bodyData.user_id)
				const connectionExists = await connectionQueries.getConnection(mentorUserId, bodyData.user_id)

				if (!connectionExists) {
					// If there's no connection request, create one first
					if (!connectionRequest) {
						await connectionQueries.addFriendRequest(
							bodyData.user_id,
							mentorUserId,
							common.CONNECTIONS_DEFAULT_MESSAGE
						)
					}

					// Approve the connection request (if newly created or already exists)
					await connectionQueries.approveRequest(mentorUserId, bodyData.user_id, connectionRequest?.meta)

					// Fetch user chat settings
					const userDetails = await userExtensionQueries.getUsersByUserIds(
						[mentorUserId, bodyData.user_id],
						{
							attributes: ['settings', 'user_id'],
						},
						true
					)

					let chatRoom
					const bothChatEnabled =
						userDetails.length === 2 &&
						userDetails[0]?.settings?.chat_enabled === true &&
						userDetails[1]?.settings?.chat_enabled === true

					if (bothChatEnabled) {
						chatRoom = await communicationHelper.createChatRoom(
							mentorUserId,
							bodyData.user_id,
							connectionRequest?.meta?.message
						)
					}

					// Update connection meta if chat room was created
					const updatedMeta = chatRoom
						? { ...connectionRequest?.meta, room_id: chatRoom.result.room.room_id }
						: connectionRequest?.meta

					await connectionQueries.updateConnection(bodyData.user_id, mentorUserId, {
						meta: updatedMeta,
					})
				}
			}

			const menteeDetails = await userExtensionQueries.getUsersByUserIds(bodyData.user_id, {
				attributes: ['name', 'email'],
			})

			const mentorDetails = await mentorExtensionQueries.getMentorExtension(mentorUserId, ['name'], true)

			let emailTemplateCode

			//assign template data
			emailTemplateCode = process.env.MENTOR_ACCEPT_SESSION_REQUEST_EMAIL_TEMPLATE

			// send mail to mentors on session creation if session created by manager
			const templateData = await notificationQueries.findOneEmailTemplate(emailTemplateCode, orgId)

			// If template data is available. create mail data and push to kafka
			if (templateData) {
				let name = menteeDetails.name
				// Push successful enrollment to session in kafka
				const payload = {
					type: 'email',
					email: {
						to: menteeDetails.email,
						subject: templateData.subject,
						body: utils.composeEmailBody(templateData.body, {
							name,
							mentorName: mentorDetails.name,
						}),
					},
				}
				console.log('EMAIL PAYLOAD: ', payload)
				await kafkaCommunication.pushEmailToKafka(payload)
			}

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: !connectionExists ? 'SESSION_REQUEST_APPROVED_AND_CONNECTED' : 'SESSION_REQUEST_APPROVED',
				result: approveSessionRequest[0]?.dataValues?.status,
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	/**
	 * Reject a pending session request.
	 * @param {Object} bodyData - The body data containing the target user ID.
	 * @param {string} bodyData.user_id - The ID of the target user.
	 * @param {string} mentorUserId - The ID of the authenticated user.
	 * @param {string} organization_id - the ID of the user organization.
	 * @returns {Promise<Object>} A success response indicating the request was rejected.
	 */
	static async reject(bodyData, userId, orgId) {
		try {
			const [rejectedCount, rejectedData] = await sessionRequestQueries.rejectRequest(
				userId,
				bodyData.user_id,
				bodyData.reason
			)

			if (rejectedCount == 0) {
				return responses.failureResponse({
					message: 'SESSION_REQUEST_NOT_FOUND_OR_ALREADY_PROCESSED',
					statusCode: httpStatusCode.not_found,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const menteeDetails = await userExtensionQueries.getUsersByUserIds(bodyData.user_id, {
				attributes: ['name', 'email'],
			})

			const MentorDetails = await mentorExtensionQueries.getMentorExtension(userId, ['name'], true)

			let emailTemplateCode

			//assign template data
			emailTemplateCode = process.env.MENTOR_REJECT_SESSION_REQUEST_EMAIL_TEMPLATE

			// send mail to mentors on session creation if session created by manager
			const templateData = await notificationQueries.findOneEmailTemplate(emailTemplateCode, orgId)

			// If template data is available. create mail data and push to kafka
			if (templateData) {
				let name = menteeDetails.name
				// Push successful enrollment to session in kafka
				const payload = {
					type: 'email',
					email: {
						to: menteeDetails.email,
						subject: templateData.subject,
						body: utils.composeEmailBody(templateData.body, {
							name,
							mentorName: MentorDetails.name,
						}),
					},
				}
				console.log('EMAIL PAYLOAD: ', payload)
				await kafkaCommunication.pushEmailToKafka(payload)
			}

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'SESSION_REQUEST_REJECTED',
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	/**
	 * Get information about a session between the authenticated user and another user.
	 * @param {Object} req - The request object.
	 * @param {Object} req.body - The body of the request.
	 * @param {string} req.body.user_id - The ID of the user to get connection info for.
	 * @param {Object} req.decodedToken - The decoded token containing authenticated user info.
	 * @param {string} req.decodedToken.id - The ID of the authenticated user.
	 * @returns {Promise<Object>} The session information.
	 * @throws Will throw an error if the request fails.
	 */
	static async getInfo(friendId, userId) {
		try {
			let requestSessions = await sessionRequestQueries.getRequestSessions(userId, friendId)

			if (!requestSessions) {
				// If no connection is found, check for pending requests
				requestSessions = await sessionRequestQueries.checkPendingRequest(userId, friendId)
			}

			if (!requestSessions || requestSessions.count == 0) {
				// If still no connection, check for the deleted request
				requestSessions = await sessionRequestQueries.getRejectedSessionRequest(userId, friendId)
			}

			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId) {
				return responses.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const [userExtensionsModelName, userDetails] = await Promise.all([
				userExtensionQueries.getModelName(),
				userExtensionQueries.getMenteeExtension(friendId, [
					'name',
					'user_id',
					'mentee_visibility',
					'organization_id',
					'designation',
					'area_of_expertise',
					'education_qualification',
					'custom_entity_text',
					'meta',
					'is_mentor',
					'experience',
					'image',
				]),
			])

			if (requestSessions?.status === common.CONNECTIONS_STATUS.BLOCKED || !userDetails) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USER_NOT_FOUND',
				})
			}
			userDetails.image &&= (await userRequests.getDownloadableUrl(userDetails.image))?.result

			// Fetch entity types associated with the user
			let entityTypes = await entityTypeQueries.findUserEntityTypesAndEntities({
				status: 'ACTIVE',
				organization_id: {
					[Op.in]: [userDetails.organization_id, defaultOrgId],
				},
				model_names: { [Op.contains]: [userExtensionsModelName] },
			})
			const validationData = removeDefaultOrgEntityTypes(entityTypes, userDetails.organization_id)
			const processedUserDetails = utils.processDbResponse(userDetails, validationData)

			if (!requestSessions) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'REQUEST_SESSION_NOT_FOUND',
					result: { user_details: processedUserDetails },
				})
			}

			requestSessions.user_details = processedUserDetails

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'REQUEST_SESSION_DETAILS',
				result: requestSessions,
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	static async userAvailability(userId, page, limit, search, status, roles) {
		try {
			// Fetch both mentor and mentee sessions in parallel
			const [enrolledSessions, mentoringSessions] = await Promise.all([
				menteeServices.getMySessions(page, limit, search, userId),
				mentorService.createdSessions(userId, page, limit, search, status, roles),
			])

			// Merge the two session arrays into one
			const allSessions = [...(mentoringSessions?.result?.data || []), ...(enrolledSessions?.rows || [])]

			// Generate combined availability
			const availability = await utils.createMentorAvailabilityResponse(allSessions)

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'SESSION_REQUEST_REJECTED',
				result: availability.result,
			})
		} catch (error) {
			return error
		}
	}
}
