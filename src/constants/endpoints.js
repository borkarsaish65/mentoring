module.exports = {
	VERIFY_MENTOR: 'v1/account/verifyMentor',
	LIST_ACCOUNTS: 'v1/account/list',
	USER_PROFILE_DETAILS: 'v1/user/read',
	USER_PROFILE_DETAILS_INTERNAL: 'v1/user/profileById',
	GET_PROFILE_BY_ID: 'v1/user/profileById',
	CREATE_MEETING: 'api/create',
	JOIN_MEETING: 'api/join',
	GET_RECORDINGS: 'api/getRecordings',
	USERS_LIST: 'v1/account/list',
	SHARE_MENTOR_PROFILE: 'v1/user/share',
	USERS_ENTITY_READ: 'v1/userentity/read',
	ORGANIZATION_READ: 'v1/organization/read',
	SEARCH_USERS: 'v1/account/search',
	USERS_ROLE_LIST: 'v1/user-role/default',
	VALIDATE_EMAIL: 'v1/account/validatingEmailIds',
	USER_DELETE: 'v1/admin/deleteUser',
	GET_TENANT_DETAILS: 'v1/tenant/readInternal',
	// Endpoints of the scheduler service
	CREATE_SCHEDULER_JOB: 'jobs/create', // Create scheduler job endpoint
	UPDATE_DELAY: 'jobs/updateDelay', // Update delay of scheduled job endpoint
	REMOVE_SCHEDULED_JOB: 'jobs/remove', // Remove scheduled job endpoint
	ORGANIZATION_LIST: 'v1/organization/list',
	VALIDATE_SESSIONS: 'v1/account/validateUserSession',
	//Communication apis
	COMMUNICATION_SIGNUP: 'v1/communication/signup',
	COMMUNICATION_LOGIN: 'v1/communication/login',
	COMMUNICATION_LOGOUT: 'v1/communication/logout',
	COMMUNICATION_CREATE_CHAT_ROOM: 'v1/communication/createRoom',
	COMMUNICATION_UPDATE_AVATAR: 'v1/communication/updateAvatar',
	COMMUNICATION_UPDATE_USER: 'v1/communication/updateUser',
	COMMUNICATION_GET_USER_ID: 'v1/communication/userMapping',
	DOWNLOAD_IMAGE_URL: 'v1/cloud-services/file/getDownloadableUrl',
	COMMUNICATION_USERS_SET_ACTIVE_STATUS: 'v1/communication/setActiveStatus',
	COMMUNICATION_USERS_REMOVE_AVATAR: 'v1/communication/removeAvatar',
}
