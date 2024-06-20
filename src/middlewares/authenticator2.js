const jwt = require('jsonwebtoken')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const requests = require('@generics/requests')
const endpoints = require('@constants/endpoints')
const rolePermissionMappingQueries = require('@database/queries/role-permission-mapping')
const responses = require('@helpers/responses')
const { Op } = require('sequelize')

async function checkPermissions(roleTitle, requestPath, requestMethod) {
	const parts = requestPath.match(/[^/]+/g)
	const apiPath = [`/${parts[0]}/${parts[1]}/${parts[2]}/*`]

	if (parts[4]) apiPath.push(`/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}*`)
	else
		apiPath.push(
			`/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}`,
			`/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}*`
		)

	if (Array.isArray(roleTitle) && !roleTitle.includes(common.PUBLIC_ROLE)) roleTitle.push(common.PUBLIC_ROLE)

	const filter = {
		role_title: roleTitle,
		module: parts[2],
		api_path: { [Op.in]: apiPath },
	}
	const attributes = ['request_type', 'api_path', 'module']
	const allowedPermissions = await rolePermissionMappingQueries.findAll(filter, attributes)

	return allowedPermissions.some((permission) => permission.request_type.includes(requestMethod))
}

module.exports = async function (req, res, next) {
	const unAuthorizedResponse = responses.failureResponse({
		message: 'UNAUTHORIZED_REQUEST',
		statusCode: httpStatusCode.unauthorized,
		responseCode: 'UNAUTHORIZED',
	})

	try {
		const authHeader = req.get('X-auth-token')
		let decodedToken
		let roleValidation = false

		const isInternalAccess = common.internalAccessUrls.some((path) => {
			if (req.path.includes(path)) {
				if (req.headers.internal_access_token === process.env.INTERNAL_ACCESS_TOKEN) return true
				throw unAuthorizedResponse
			}
			return false
		})

		common.roleValidationPaths.forEach((path) => {
			if (req.path.includes(path)) roleValidation = true
		})

		if (isInternalAccess && !authHeader) return next()

		if (!authHeader) {
			const isPermissionValid = await checkPermissions(common.PUBLIC_ROLE, req.path, req.method)
			if (!isPermissionValid) {
				throw responses.failureResponse({
					message: 'PERMISSION_DENIED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			return next()
		}

		const [authType, token] = authHeader.split(' ')
		if (authType !== 'bearer') throw unAuthorizedResponse

		try {
			decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
		} catch (err) {
			if (err.name === 'TokenExpiredError') {
				throw responses.failureResponse({
					message: 'ACCESS_TOKEN_EXPIRED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			throw unAuthorizedResponse
		}

		if (process.env.AUTH_METHOD === common.AUTH_METHOD.USER_SERVICE) {
			try {
				const userBaseUrl = `${process.env.USER_SERVICE_HOST}${process.env.USER_SERVICE_BASE_URL}`
				const validateSessionEndpoint = `${userBaseUrl}${endpoints.VALIDATE_SESSIONS}`
				const reqBody = { token: authHeader }

				const isSessionActive = await requests.post(validateSessionEndpoint, reqBody, '', true)

				if (isSessionActive.data.responseCode === 'UNAUTHORIZED') throw new Error('ACCESS_TOKEN_EXPIRED')
				if (!isSessionActive.data.result.data.user_session_active) throw new Error('USER_SERVICE_DOWN')
			} catch (error) {
				if (error.message === 'ACCESS_TOKEN_EXPIRED') {
					throw responses.failureResponse({
						message: error.message,
						statusCode: httpStatusCode.unauthorized,
						responseCode: error.responseCode,
					})
				}
				throw responses.failureResponse({
					message: 'USER_SERVICE_DOWN',
					statusCode: httpStatusCode.internal_server_error,
					responseCode: 'SERVER_ERROR',
				})
			}
		}

		if (!decodedToken) throw unAuthorizedResponse

		if (decodedToken.data.roles) {
			const isAdmin = decodedToken.data.roles.some((role) => role.title === common.ADMIN_ROLE)
			if (isAdmin) {
				req.decodedToken = decodedToken.data
				return next()
			}
		}

		if (roleValidation) {
			const userBaseUrl = `${process.env.USER_SERVICE_HOST}${process.env.USER_SERVICE_BASE_URL}`
			const profileUrl = `${userBaseUrl}${endpoints.USER_PROFILE_DETAILS}/${decodedToken.data.id}`
			const user = await requests.get(profileUrl, null, true)

			if (!user || !user.success) {
				throw responses.failureResponse({
					message: 'USER_NOT_FOUND',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			if (user.data.result.deleted_at !== null) {
				throw responses.failureResponse({
					message: 'USER_ROLE_UPDATED',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			decodedToken.data.roles = user.data.result.user_roles
			decodedToken.data.organization_id = user.data.result.organization_id
		}

		const isPermissionValid = await checkPermissions(
			decodedToken.data.roles.map((role) => role.title),
			req.path,
			req.method
		)

		if (!isPermissionValid) {
			throw responses.failureResponse({
				message: 'PERMISSION_DENIED',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}

		req.decodedToken = {
			id: decodedToken.data.id,
			roles: decodedToken.data.roles,
			name: decodedToken.data.name,
			token: authHeader,
			organization_id: decodedToken.data.organization_id,
		}
		next()
	} catch (err) {
		console.log(err)
		next(err)
	}
}
