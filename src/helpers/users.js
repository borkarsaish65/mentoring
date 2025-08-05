'use strict'

const sessionRequestQueries = require('@database/queries/requestSessions')
const connectionQueries = require('@database/queries/connection')
const common = require('@constants/common')

module.exports = class UserServiceHelper {
	/**
	 * Fetches counts of pending session and connection requests for a given user.
	 *
	 * @param {string} userId - The user ID to check requests for.
	 * @returns {Promise<{connectionRequestCount: number, sessionRequestcount: number} | null>}
	 */
	static async findRequestCounts(userId) {
		try {
			let sessionRequestcount = 0,
				connectionRequestCount = 0
			if (process.env.ENABLE_CHAT) {
				const chatRequest = await connectionQueries.getRequestsCount(userId)
				connectionRequestCount = chatRequest
			}

			const sessionRequest = await sessionRequestQueries.getCount(userId, [common.CONNECTIONS_STATUS.REQUESTED])
			sessionRequestcount = sessionRequest

			return {
				connectionRequestCount,
				sessionRequestcount,
			}
		} catch (err) {
			console.error('Error in findRequestCounts:', err)
			return null
		}
	}
}
