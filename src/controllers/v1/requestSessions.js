const requestSessionsService = require('@services/requestSessions')
const { isAMentor } = require('@generics/utils')

module.exports = class requestsSessions {
	/**
	 * Initiates a session request between two users.
	 * @param {Object} bodyData - The request body requesting session related information.
	 * @param {string} bodyData.friend_id - The ID of the target user.
	 * @param {string} userId - The ID of the user initiating the request.
	 * @returns {Promise<Object>} A success or failure response.
	 */
	async create(req) {
		try {
			const SkipValidation = req.SkipValidation ? req.SkipValidation : false
			return await requestSessionsService.create(
				req.body,
				req.decodedToken.id,
				req.decodedToken.organization_id,
				SkipValidation
			)
		} catch (error) {
			return error
		}
	}

	/**
	 * Get a list of pending session requests for a user.
	 * @param {string} userId - The ID of the user.
	 * @param {number} pageNo - The page number for pagination.
	 * @param {number} pageSize - The number of records per page.
	 * @returns {Promise<Object>} The list of pending session requests.
	 */
	async list(req) {
		try {
			const requestSessionDetails = await requestSessionsService.list(
				req.decodedToken.id,
				req.pageNo,
				req.pageSize
			)
			return requestSessionDetails
		} catch (error) {
			return error
		}
	}

	/**
	 * Get a list of pending session requests for a user.
	 * @param {string} userId - The ID of the user.
	 * @param {number} pageNo - The page number for pagination.
	 * @param {number} pageSize - The number of records per page.
	 * @returns {Promise<Object>} The list of pending session requests.
	 */
	async pendingList(req) {
		try {
			const requestSessionDetails = await requestSessionsService.pendingList(
				req.decodedToken.id,
				req.pageNo,
				req.pageSize
			)
			return requestSessionDetails
		} catch (error) {
			return error
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
	async accept(req) {
		try {
			const notifyUser = req.query.notifyUser ? req.query.notifyUser.toLowerCase() === 'true' : true
			if (req.headers.timezone) {
				req.body['time_zone'] = req.headers.timezone
			}
			const acceptRequestSession = await requestSessionsService.accept(
				req.body,
				req.decodedToken.id,
				req.decodedToken.organization_id,
				isAMentor(req.decodedToken.roles),
				notifyUser
			)
			return acceptRequestSession
		} catch (error) {
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
	async reject(req) {
		try {
			return await requestSessionsService.reject(req.body, req.decodedToken.id, req.decodedToken.organization_id)
		} catch (error) {
			throw error
		}
	}

	async getDetails(req) {
		try {
			return await requestSessionsService.getInfo(
				req.body.user_id,
				req.decodedToken.id,
				req.body.start_date,
				req.body.end_date,
				req.body.status
			)
		} catch (error) {
			throw error
		}
	}

	async userAvailability(req) {
		try {
			return await requestSessionsService.userAvailability(
				req.decodedToken.id,
				req.query.pageNo,
				req.query.pageSize,
				req.query.searchText,
				req.query.status,
				req.decodedToken.roles
			)
		} catch (error) {
			throw error
		}
	}
}
