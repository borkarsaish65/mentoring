const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const utils = require('@generics/utils')
const kafkaCommunication = require('@generics/kafka-communication')
const sessionQueries = require('@database/queries/sessions')
const sessionAttendeesQueries = require('@database/queries/sessionAttendees')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const mentorQueries = require('@database/queries/mentorExtension')
const menteeQueries = require('@database/queries/userExtension')
const adminService = require('../generics/materializedViews')
const responses = require('@helpers/responses')
const requestSessionsService = require('@services/requestSessions')
const requestSessionQueries = require('@database/queries/requestSessions')
const userRequests = require('@requests/user')
const mentorExtensionQueries = require('@database/queries/mentorExtension')
const organisationExtensionQueries = require('@database/queries/organisationExtension')
const communicationHelper = require('@helpers/communications')
const moment = require('moment')
const connectionQueries = require('@database/queries/connection')

module.exports = class AdminHelper {
	/**
	 * userDelete
	 * @method
	 * @name userDelete
	 * @param {decodedToken} decodedToken - decoded token of admin.
	 * @param {userId} userId - UserId of the user that needs to be deleted
	 * @returns {JSON} - List of users
	 */

	static async userDelete(decodedToken, userId) {
		try {
			let result = {}

			// Step 1: Fetch user details
			const getUserDetails = await menteeQueries.getUsersByUserIds([userId]) // userId = "1"
			if (!getUserDetails || getUserDetails.length === 0) {
				return responses.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'USER_NOT_FOUND',
					result,
				})
			}

			const userInfo = getUserDetails[0]
			const isMentor = userInfo.isMentor === true

			// Step 2: Check if user is a session manager
			const getUserDetailById = await userRequests.fetchUserDetails({ userId }) // userId = "1"
			const roleTitles = getUserDetailById?.data?.result?.user_roles?.map((r) => r.title) || []
			const isSessionManager = roleTitles.includes(common.SESSION_MANAGER_ROLE)

			// Step 3: Optional logic to mark Session Manager as UNDER_DELETION
			// const isAlreadyUnderDeletion = userInfo.status === common.UNDER_DELETION_STATUS;
			// if (isSessionManager) {
			// 	if (isAlreadyUnderDeletion) {
			// 		return responses.failureResponse({
			// 			statusCode: httpStatusCode.bad_request,
			// 			message: 'USER_ALREADY_UNDER_DELETION',
			// 			result,
			// 		});
			// 	}

			// 	const updateData = { status: common.UNDER_DELETION_STATUS };

			// 	if (isMentor) {
			// 		await mentorQueries.updateMentorExtension(userId, updateData, true);
			// 	} else {
			// 		await menteeQueries.updateMenteeExtension(userId, updateData, true);
			// 	}

			// 	return responses.successResponse({
			// 		statusCode: httpStatusCode.ok,
			// 		message: 'USER_UNDER_DELETION',
			// 		result,
			// 	});
			// }

			// Prevent deletion of session manager directly
			if (isSessionManager) {
				return responses.failureResponse({
					statusCode: httpStatusCode.bad_request,
					message: 'SESSION_MANAGER_DELETION_UNSUCCESSFUL',
					result,
				})
			}

			// Step 4: Check for user connections
			const connectionExists = await connectionQueries.getConnectionsCount('', userId, [
				decodedToken.organization_id,
			]) // filter, userId = "1", organizationIds = ["1", "2"]

			if (connectionExists.count !== 0) {
				// Soft delete in communication service
				const removeChatUser = await communicationHelper.setActiveStatus(userId, false) // ( userId = "1", activeStatus = "true" or "false")

				// Update user name to 'User Not Found'
				const updateChatUserName = await communicationHelper.updateUser(userId, common.USER_NOT_FOUND) // userId: "1", name: "User Name"

				result.isChatUserRemoved = removeChatUser?.result?.success === true
				result.isChatNameUpdated = updateChatUserName?.result?.success === true

				// Delete user connections and requests from DB
				result.isConnectionsAndRequestsRemoved = await connectionQueries.deleteUserConnectionsAndRequests(
					userId
				) // userId = "1"
			}

			// Step 5: Session Request Deletion & Notifications
			const requestSessions = await this.findAllRequestSessions(userId) // userId = "1"

			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId)
				return responses.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})

			if (requestSessions !== true) {
				const { allSessionRequestIds = [], requestedSessions = [], receivedSessions = [] } = requestSessions

				// Collect all session request IDs for deletion
				result.isRequestedSessionRemoved = await requestSessionQueries.markRequestsAsDeleted(
					allSessionRequestIds
				) // allSessionRequestIds = ["1", "2"]

				if (requestedSessions.length > 0) {
					result.isRequestedSessionMentorNotified = await this.NotifySessionRequestedUsers(
						requestedSessions,
						false,
						true,
						defaultOrgId
					) // (sessionsDetails, received = true or false, sent = true or false , orgId = "1")
				}

				if (isMentor && receivedSessions.length > 0) {
					result.isRequestedSessionMenteeNotified = await this.NotifySessionRequestedUsers(
						receivedSessions,
						true,
						false,
						defaultOrgId
					) // (sessionsDetails, received = true or false, sent = true or false , orgId = "1")
				}
			}

			// Step 6: Remove user and sessions
			let removedUserDetails = 0

			if (isMentor) {
				// Remove mentor from DB
				removedUserDetails = await mentorQueries.removeMentorDetails(userId) // userId = "1"

				// Unenroll and notify attendees of sessions created by mentor
				const removedSessionsDetail = await sessionQueries.removeAndReturnMentorSessions(userId) // userId = "1"
				result.isAttendeesNotified = await this.unenrollAndNotifySessionAttendees(
					removedSessionsDetail,
					userInfo.organization_id || ''
				) //removedSessionsDetail , orgId : "1")
			} else {
				// Remove mentee from DB
				removedUserDetails = await menteeQueries.removeMenteeDetails(userId) // userId = "1"
			}

			result.areUserDetailsCleared = removedUserDetails > 0

			// Step 7: Unenroll from any upcoming sessions as attendee
			result.isUnenrolledFromSessions = await this.unenrollFromUpcomingSessions(userId) // userId = "1"

			// Step 8: Final Response
			if (result.isUnenrolledFromSessions && result.areUserDetailsCleared) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'USER_REMOVED_SUCCESSFULLY',
					result,
				})
			}
			return responses.failureResponse({
				statusCode: httpStatusCode.bad_request,
				message: 'USER_NOT_REMOVED_SUCCESSFULLY',
				result,
			})
		} catch (error) {
			console.error('An error occurred in userDelete:', error)
			return error
		}
	}

	// Session Manager Deletion Flow Codes

	// static async assignNewSessionManager(decodedToken, oldSessionManagerId, newSessionManagerId, orgAdminUserId) {
	// 	if (!decodedToken.roles.some((role) => role.title === common.ADMIN_ROLE)) {
	// 		return responses.failureResponse({
	// 			message: 'UNAUTHORIZED_REQUEST',
	// 			statusCode: httpStatusCode.unauthorized,
	// 			responseCode: 'UNAUTHORIZED',
	// 		})
	// 	}

	// 	let result = {}

	// 	const getUserDetails = await menteeQueries.getUsersByUserIds([oldSessionManagerId])
	// 	if (getUserDetails.length <= 0) {
	// 		return responses.failureResponse({
	// 			statusCode: httpStatusCode.bad_request,
	// 			message: 'USER_NOT_FOUND',
	// 			result,
	// 		})
	// 	}

	// 	const userInfo = getUserDetails[0]
	// 	const isMentor = userInfo.isMentor === true
	// 	const isAlreadyUnderDeletion = userInfo.status === common.UNDER_DELETION_STATUS

	// 	// ✅ Step 1: Validate using org policy helper
	// 	const policyValidationResponse = await this.validateSessionReassignmentPolicies(
	// 		oldSessionManagerId,
	// 		newSessionManagerId,
	// 		orgAdminUserId
	// 	)
	// 	// If policy validation fails, return directly
	// 	if (policyValidationResponse.statusCode === httpStatusCode.bad_request) {
	// 		return policyValidationResponse
	// 	}

	// 	// If user is not under deletion
	// 	if (!isAlreadyUnderDeletion) {
	// 		return responses.failureResponse({
	// 			statusCode: httpStatusCode.bad_request,
	// 			message: 'USER_DELETION_NOT_INITIATED',
	// 			result,
	// 		})
	// 	}

	// 	// ✅ Step 2: Proceed with reassignment logic
	// 	let updateSessionsByNewSessionManager
	// 	let removedUserDetails

	// 	const isSessionManager = true // Based on logic context, assuming already validated

	// 	if (isSessionManager && isMentor) {
	// 		updateSessionsByNewSessionManager = await sessionQueries.replaceSessionManagerAndReturn(
	// 			oldSessionManagerId,
	// 			newSessionManagerId,
	// 			orgAdminUserId
	// 		)
	// 		removedUserDetails = await mentorQueries.removeMentorDetails(oldSessionManagerId)
	// 			const removedSessionsDetail = await sessionQueries.removeAndReturnMentorSessions(oldSessionManagerId)
	// 			result.isAttendeesNotified = await this.unenrollAndNotifySessionAttendees(
	// 				removedSessionsDetail,
	// 				userInfo.organization_id ? userInfo.organization_id : ''
	// 			)
	// 	} else if (isSessionManager) {
	// 		updateSessionsByNewSessionManager = await sessionQueries.replaceSessionManagerAndReturn(
	// 			oldSessionManagerId,
	// 			newSessionManagerId
	// 		)

	// 		removedUserDetails = await menteeQueries.removeMenteeDetails(oldSessionManagerId)
	// 	}

	// 	result.sessionsUpdated = updateSessionsByNewSessionManager
	// 	return responses.successResponse({
	// 		statusCode: httpStatusCode.ok,
	// 		message: 'SESSION_MANAGER_REASSIGNED_SUCCESSFULLY',
	// 		result,
	// 	})
	// }

	static async NotifySessionRequestedUsers(sessionsDetails, received = false, sent = false, orgId = '') {
		try {
			// Get the appropriate template
			const templateData = await notificationTemplateQueries.findOneEmailTemplate(
				received
					? process.env.MENTEE_SESSION_REQUEST_DELETION_EMAIL_CODE
					: process.env.MENTOR_SESSION_REQUEST_DELETION_EMAIL_CODE,
				orgId
			)

			for (const session of sessionsDetails) {
				let userIds = []
				let sessionDetails = []

				if (received) {
					userIds = session.map((user) => user.requestor_id)
					sessionDetails = session.map((user) => ({
						user_id: user.requestor_id,
					}))
				}

				if (sent) {
					userIds = session.map((user) => user.requestee_id)
					sessionDetails = session.map((user) => {
						const dateTime = moment.unix(user.start_date)
						return {
							user_id: user.requestee_id,
							date: dateTime.format('DD-MM-YYYY'),
							time: dateTime.format('hh:mm A'),
						}
					})
				}

				const userProfiles = await menteeQueries.getUsersByUserIds(userIds, {}, true)

				const sendEmailPromises = userProfiles.map(async (user) => {
					const userSessionInfo = sessionDetails.find((detail) => detail.user_id === user.id)

					// Base data for body and subject
					const emailTemplateData = {
						nameOfTheSession: session.title,
					}

					if (sent && userSessionInfo) {
						emailTemplateData.Date = userSessionInfo.date
						emailTemplateData.Time = userSessionInfo.time
					}

					const payload = {
						type: 'email',
						email: {
							to: user.email,
							subject: sent
								? utils.composeEmailBody(templateData.subject, emailTemplateData)
								: templateData.subject,
							body: utils.composeEmailBody(templateData.body, emailTemplateData),
						},
					}

					await kafkaCommunication.pushEmailToKafka(payload)
				})

				await Promise.all(sendEmailPromises)
			}

			return true
		} catch (error) {
			console.error('An error occurred in NotifySessionRequestedUsers:', error)
			return error
		}
	}

	static async unenrollAndNotifySessionAttendees(removedSessionsDetail, orgId = '') {
		try {
			const templateData = await notificationTemplateQueries.findOneEmailTemplate(
				process.env.MENTOR_SESSION_DELETION_EMAIL_CODE,
				orgId
			)

			for (const session of removedSessionsDetail) {
				const sessionAttendees = await sessionAttendeesQueries.findAll({
					session_id: session.id,
				})

				const sessionAttendeesIds = sessionAttendees.map((attendee) => attendee.mentee_id)

				const attendeeProfiles = await menteeQueries.getUsersByUserIds(sessionAttendeesIds, {}, true)

				console.log('ATTENDEE PROFILES: ', attendeeProfiles)

				const sendEmailPromises = attendeeProfiles.map(async (attendee) => {
					const payload = {
						type: 'email',
						email: {
							to: attendee.email,
							subject: templateData.subject,
							body: utils.composeEmailBody(templateData.body, {
								nameOfTheSession: session.title,
							}),
						},
					}
					await kafkaCommunication.pushEmailToKafka(payload)
				})
				await Promise.all(sendEmailPromises)
			}
			const sessionIds = removedSessionsDetail.map((session) => session.id)
			const unenrollCount = await sessionAttendeesQueries.unEnrollAllAttendeesOfSessions(sessionIds)
			return true
		} catch (error) {
			console.error('An error occurred in notifySessionAttendees:', error)
			return error
		}
	}

	static async unenrollFromUpcomingSessions(userId) {
		try {
			const upcomingSessions = await sessionQueries.getAllUpcomingSessions(false)

			const upcomingSessionsId = upcomingSessions.map((session) => session.id)
			const usersUpcomingSessions = await sessionAttendeesQueries.usersUpcomingSessions(
				userId,
				upcomingSessionsId
			)
			if (usersUpcomingSessions.length === 0) {
				return true
			}
			await Promise.all(
				usersUpcomingSessions.map(async (session) => {
					await sessionQueries.updateEnrollmentCount(session.session_id, true)
				})
			)

			const unenrollFromUpcomingSessions = await sessionAttendeesQueries.unenrollFromUpcomingSessions(
				userId,
				upcomingSessionsId
			)
			return true
		} catch (error) {
			console.error('An error occurred in unenrollFromUpcomingSessions:', error)
			return error
		}
	}

	static async findAllRequestSessions(userId) {
		const findAllRequests = await requestSessionsService.list(userId, '', '', common.CONNECTIONS_STATUS.REQUESTED) // (userId: "1", pageNo, pageSize, status: "requested")

		if (!findAllRequests || findAllRequests.result.count === 0) {
			return true
		}

		const allData = findAllRequests.result.data || []

		const allSessionRequestIds = []
		const requestedSessions = []
		const receivedSessions = []

		for (const sessionRequest of allData) {
			allSessionRequestIds.push(sessionRequest.id)

			if (sessionRequest.request_type === 'sent') {
				requestedSessions.push(sessionRequest) // full data
			} else if (sessionRequest.request_type === 'received') {
				receivedSessions.push(sessionRequest) // full data
			}
		}

		return {
			allSessionRequestIds, // array of IDs
			requestedSessions, // array of objects
			receivedSessions, // array of objects
		}
	}

	static async triggerViewRebuild(decodedToken) {
		try {
			const result = await adminService.triggerViewBuild()
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MATERIALIZED_VIEW_GENERATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.error('An error occurred in userDelete:', error)
			return error
		}
	}
	static async triggerPeriodicViewRefresh(decodedToken) {
		try {
			const result = await adminService.triggerPeriodicViewRefresh()
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MATERIALIZED_VIEW_REFRESH_INITIATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.error('An error occurred in userDelete:', error)
			return error
		}
	}
	static async triggerPeriodicViewRefreshInternal(modelName) {
		try {
			const result = await adminService.refreshMaterializedView(modelName)
			console.log(result)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'MATERIALIZED_VIEW_REFRESH_INITIATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.error('An error occurred in userDelete:', error)
			return error
		}
	}

	// Session Manager Deletion Flow Codes

	// static async validateSessionReassignmentPolicies(oldSessionManagerId, newSessionManagerId, orgAdminUserId) {
	// 	try {
	// 		const userIds = Array.from(new Set([oldSessionManagerId, newSessionManagerId, orgAdminUserId])); // avoid duplicate fetch
	// 		const userDetailsResponse = await userRequests.getListOfUserDetails(userIds, true);
	// 		const users = userDetailsResponse?.result || [];
	// 		const getUserById = (id) => users.find(u => u.id === id);
	// 		const oldSMUser = getUserById(oldSessionManagerId);
	// 		const newSMUser = getUserById(newSessionManagerId);
	// 		const orgAdminUser = getUserById(orgAdminUserId);

	// 		if (!oldSMUser) {
	// 			return responses.failureResponse({
	// 				statusCode: httpStatusCode.bad_request,
	// 				message: `Old session manager (ID: ${oldSessionManagerId}) not found`,
	// 			});
	// 		}

	// 		const oldOrgId = oldSMUser.organization_id;

	// 		const getExtensionData = async (userId) => {
	// 			const user = getUserById(userId);
	// 			if (!user) return null;

	// 			const roles = (user.user_roles || []).map(r => r.title);
	// 			if (roles.includes(common.MENTOR_ROLE)) {
	// 				return mentorExtensionQueries.getMentorExtension(userId, ['organization_id']);
	// 			} else if (roles.includes(common.MENTEE_ROLE)) {
	// 				return menteeQueries.getMenteeExtension(userId, ['organization_id']);
	// 			}
	// 			return null;
	// 		};

	// 		const uniqueUserIdsForExtension = Array.from(new Set([
	// 			oldSessionManagerId,
	// 			newSessionManagerId,
	// 			orgAdminUserId,
	// 		]));

	// 		const extensionResults = await Promise.all(uniqueUserIdsForExtension.map(id => getExtensionData(id)));
	// 		const extensionMap = {};
	// 		uniqueUserIdsForExtension.forEach((id, idx) => extensionMap[id] = extensionResults[idx]);

	// 		const newSMPolicy = extensionMap[newSessionManagerId];
	// 		const orgAdminPolicy = extensionMap[orgAdminUserId];

	// 		if (!newSMPolicy || !newSMPolicy.organization_id) {
	// 			return responses.failureResponse({
	// 				statusCode: httpStatusCode.bad_request,
	// 				message: `New session manager (ID: ${newSessionManagerId}) has no organization_id in extension data`,
	// 			});
	// 		}

	// 		if (!orgAdminPolicy || !orgAdminPolicy.organization_id) {
	// 			return responses.failureResponse({
	// 				statusCode: httpStatusCode.bad_request,
	// 				message: `Org admin (ID: ${orgAdminUserId}) has no organization_id in extension data`,
	// 			});
	// 		}

	// 		const getUserRoleTitles = (user) => (user?.user_roles || []).map(r => r.title);

	// 		if (!getUserRoleTitles(newSMUser).includes(common.SESSION_MANAGER_ROLE)) {
	// 			return responses.failureResponse({
	// 				statusCode: httpStatusCode.bad_request,
	// 				message: `New session manager (ID: ${newSessionManagerId}) does not have required role: ${common.SESSION_MANAGER_ROLE}`,
	// 			});
	// 		}

	// 		if (!getUserRoleTitles(orgAdminUser).includes(common.ORG_ADMIN_ROLE)) {
	// 			return responses.failureResponse({
	// 				statusCode: httpStatusCode.bad_request,
	// 				message: 'Org admin must have ORG_ADMIN_ROLE in the same organization as old session manager.',
	// 			});
	// 		}

	// 		const isUserAllowedToAccessOrg = async (userId, targetOrgId) => {
	// 			const mentorExt = await mentorQueries.getMentorExtension(userId, ['organization_id']);
	// 			const menteeExt = await menteeQueries.getMenteeExtension(userId, ['organization_id']);

	// 			const policiesToCheck = [];
	// 			if (mentorExt?.organization_id) policiesToCheck.push(mentorExt.organization_id);
	// 			if (menteeExt?.organization_id) policiesToCheck.push(menteeExt.organization_id);

	// 			for (const orgId of policiesToCheck) {
	// 				const orgPolicy = await organisationExtensionQueries.findOne(
	// 					{ organization_id: orgId },
	// 					{ attributes: ['external_mentee_visibility_policy'] }
	// 				);

	// 				const visibilityPolicy = orgPolicy?.external_mentee_visibility_policy;
	// 				if (!visibilityPolicy) continue;

	// 				if (visibilityPolicy === common.CURRENT) {
	// 					if (orgId === targetOrgId) return true;
	// 				} else if (visibilityPolicy === common.ASSOCIATED) {

	// 					const mentor = await mentorQueries.getMentorExtension(
	// 						 userId,
	// 						{ attributes: ['visible_to_organizations', 'mentee_visibility'] }
	// 					)

	// 					if (
	// 						mentor &&
	// 						mentor.mentee_visibility !== 'CURRENT' &&
	// 						Array.isArray(mentor.visible_to_organizations) &&
	// 						mentor.visible_to_organizations.includes(targetOrgId)
	// 					) {
	// 						return true;
	// 					}
	// 				} else if (visibilityPolicy === common.ALL) {
	// 					return true;
	// 				}
	// 			}
	// 			return false;
	// 		};

	// 		const isNewSMAllowed = await isUserAllowedToAccessOrg(newSessionManagerId, oldOrgId);
	// 		if (!isNewSMAllowed) {
	// 			return responses.failureResponse({
	// 				statusCode: httpStatusCode.bad_request,
	// 				message: `New session manager (ID: ${newSessionManagerId}) does not have policy access to old session manager's organization`,
	// 			});
	// 		}

	// 		// Only check orgAdmin if it's a different user than newSessionManager
	// 		if (newSessionManagerId !== orgAdminUserId) {
	// 			const isOrgAdminAllowed = await isUserAllowedToAccessOrg(orgAdminUserId, oldOrgId);
	// 			if (!isOrgAdminAllowed) {
	// 				return responses.failureResponse({
	// 					statusCode: httpStatusCode.bad_request,
	// 					message: `Org admin (ID: ${orgAdminUserId}) does not have policy access to old session manager's organization`,
	// 				});
	// 			}
	// 		}

	// 		return true

	// 	} catch (error) {
	// 		return responses.failureResponse({
	// 			statusCode: httpStatusCode.bad_request,
	// 			message: `Session policy validation failed: ${error.message}`,
	// 			responseCode: 'CLIENT_ERROR',
	// 		});
	// 	}
	// }
}
