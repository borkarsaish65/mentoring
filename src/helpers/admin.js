const Session = require('@database/models/index').Session
const SessionAttendee = require('@database/models/index').SessionAttendee
const { QueryTypes } = require('sequelize')
const sequelize = require('@database/models/index').sequelize
const Connection = require('@database/models/index').Connection
const common = require('@constants/common')

const mentorExtensionQueries = require('@database/queries/mentorExtension')
const userExtensionQueries = require('@database/queries/userExtension')

module.exports = class adminHelper {
	static async getPrivateSessionsWithDeletedMentee(menteeUserId) {
		try {
			// Get private sessions where the deleted mentee was enrolled and session is in future
			const query = `
                SELECT DISTINCT s.id, s.title, s.mentor_id, s.start_date, s.end_date, s.type
                FROM ${Session.tableName} s
                INNER JOIN ${SessionAttendee.tableName} sa ON s.id = sa.session_id
                WHERE sa.mentee_id = :menteeUserId
                AND s.type = :privateType
                AND s.start_date > :currentTime
                AND s.deleted_at IS NULL
            `

			const privateSessions = await sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: {
					menteeUserId,
					privateType: common.SESSION_TYPE.PRIVATE,
					currentTime: Math.floor(Date.now() / 1000),
				},
			})

			return privateSessions || []
		} catch (error) {
			console.error('Error getting private sessions with deleted mentee:', error)
			return []
		}
	}

	static async getConnectedMentors(menteeUserId) {
		try {
			// Use raw query to get connected mentors

			const { QueryTypes } = require('sequelize')
			const sequelize = require('@database/models/index').sequelize

			const query = `
				SELECT DISTINCT user_id 
				FROM ${Connection.tableName} 
				WHERE friend_id = :menteeUserId 
				AND status = :acceptedStatus
			`

			const connections = await sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: {
					menteeUserId,
					acceptedStatus: common.CONNECTIONS_STATUS.ACCEPTED,
				},
			})

			const mentorIds = connections.map((conn) => conn.user_id)

			if (mentorIds.length === 0) {
				return []
			}

			// Get mentor details for notification
			const mentors = (await mentorExtensionQueries.getMentorsByUserIds)
				? await mentorExtensionQueries.getMentorsByUserIds(mentorIds, {
						attributes: ['user_id', 'name', 'email'],
				  })
				: await userExtensionQueries.getUsersByUserIds(mentorIds, {
						attributes: ['user_id', 'name', 'email'],
				  })

			return mentors || []
		} catch (error) {
			console.error('Error getting connected mentors:', error)
			return []
		}
	}
	static async getUpcomingSessionsForMentor(mentorUserId) {
		try {
			const query = `
				SELECT s.*, s.created_by
				FROM ${Session.tableName} s
				WHERE s.mentor_id = :mentorUserId 
				AND s.start_date > :currentTime
				AND s.deleted_at IS NULL
				AND s.created_by IS NOT NULL
				AND s.created_by != :mentorUserId
			`

			const upcomingSessions = await sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: {
					mentorUserId,
					currentTime: Math.floor(Date.now() / 1000),
				},
			})

			return upcomingSessions || []
		} catch (error) {
			console.error('Error getting upcoming sessions for mentor:', error)
			return []
		}
	}

	static async notifyAndCancelPrivateSessions(privateSessions, orgId) {
		try {
			let allNotificationsSent = true

			for (const session of privateSessions) {
				// Check if this is a one-on-one session (only one attendee)
				const attendeeCount = await SessionAttendee.count({
					where: { session_id: session.id },
				})

				if (attendeeCount === 1) {
					// This is a one-on-one private session, cancel it and notify mentor
					const notificationSent = await this.notifyMentorAboutPrivateSessionCancellation(
						session.mentor_id,
						session,
						orgId
					)

					if (!notificationSent) {
						allNotificationsSent = false
					}

					// Mark session as cancelled/deleted
					const Session = require('@database/models/index').Session
					await Session.update({ deleted_at: new Date() }, { where: { id: session.id } })

					console.log(`Cancelled private session ${session.id} due to mentee deletion`)
				}
			}

			return allNotificationsSent
		} catch (error) {
			console.error('Error notifying and cancelling private sessions:', error)
			return false
		}
	}

	static async getUpcomingSessionsForMentee(menteeUserId) {
		try {
			// Get private sessions where the deleted mentee was enrolled and session is in future
			const query = `
             SELECT s.*, s.created_by
             FROM ${Session.tableName} s
             INNER JOIN ${SessionAttendee.tableName} sa ON s.id = sa.session_id
             WHERE sa.mentee_id = :menteeUserId
             AND s.type = :privateType
             AND s.start_date > :currentTime
             AND s.deleted_at IS NULL
         `

			const upcomingSessions = await sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: {
					menteeUserId,
					privateType: common.SESSION_TYPE.PRIVATE,
					currentTime: Math.floor(Date.now() / 1000),
				},
			})

			return upcomingSessions || []
		} catch (error) {
			console.error('Error getting upcoming sessions for mentor:', error)
			return []
		}
	}

	static async deleteSessionsWithAssignedMentor(mentorUserId, orgId) {
		try {
			// Get sessions where this mentor was assigned (not created by mentor, but assigned as mentor)
			const query = `
				SELECT s.*, sa.mentee_id
				FROM ${Session.tableName} s
				INNER JOIN ${SessionAttendee.tableName} sa ON s.id = sa.session_id
				WHERE s.mentor_id = :mentorUserId 
				AND s.start_date > :currentTime
				AND s.deleted_at IS NULL
				AND s.created_by != :mentorUserId
			`

			const sessionsToDelete = await sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: {
					mentorUserId,
					currentTime: Math.floor(Date.now() / 1000),
				},
			})

			if (sessionsToDelete.length === 0) {
				return true
			}

			// Notify attendees about session deletion
			await this.notifyAttendeesAboutSessionDeletion(sessionsToDelete, orgId)

			// Delete the sessions
			const sessionIds = [...new Set(sessionsToDelete.map((s) => s.id))]
			await Session.update({ deleted_at: new Date() }, { where: { id: sessionIds } })

			console.log(`Deleted ${sessionIds.length} sessions with assigned mentor`)
			return true
		} catch (error) {
			console.error('Error deleting sessions with assigned mentor:', error)
			return false
		}
	}

	static async getConnectedMentees(mentorUserId) {
		try {
			const query = `
                SELECT DISTINCT friend_id as user_id
                FROM ${Connection.tableName} 
                WHERE user_id = :mentorUserId 
                AND status = :acceptedStatus
            `

			const connections = await sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: {
					mentorUserId,
					acceptedStatus: common.CONNECTIONS_STATUS.ACCEPTED,
				},
			})

			const menteeIds = connections.map((conn) => conn.user_id)

			if (menteeIds.length === 0) {
				return []
			}

			const mentees = await userExtensionQueries.getUsersByUserIds(menteeIds, {
				attributes: ['user_id', 'name', 'email'],
			})

			return mentees || []
		} catch (error) {
			console.error('Error getting connected mentees:', error)
			return []
		}
	}

	static async getPendingSessionRequestsForMentor(mentorUserId) {
		try {
			const { QueryTypes } = require('sequelize')
			const sequelize = require('@database/models/index').sequelize
			const RequestSession = require('@database/models/index').RequestSession

			const query = `
                SELECT rs.*, rm.requestee_id
                FROM ${RequestSession.tableName} rs
                INNER JOIN request_session_mapping rm ON rs.id = rm.request_session_id
                WHERE rm.requestee_id = :mentorUserId 
                AND rs.status = :requestedStatus
                AND rs.deleted_at IS NULL
            `

			const pendingRequests = await sequelize.query(query, {
				type: QueryTypes.SELECT,
				replacements: {
					mentorUserId,
					requestedStatus: common.CONNECTIONS_STATUS.REQUESTED,
				},
			})

			return pendingRequests || []
		} catch (error) {
			console.error('Error getting pending session requests for mentor:', error)
			return []
		}
	}
}
