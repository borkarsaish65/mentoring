const axios = require('axios')
const apiEndpoints = require('@constants/endpoints')
//const baseUrl = process.env.USER_SERVICE_HOST + process.env.USER_SERVICE_BASE_URL
const baseUrl = 'http://bpp-service:3070/bpp1/'
const internalAccessToken = process.env.INTERNAL_ACCESS_TOKEN

// Create Axios instance with default configurations for base URL and headers
const apiClient = axios.create({
	baseURL: baseUrl,
	headers: {
		'x-internal-token': internalAccessToken,
		'Content-Type': 'application/json',
	},
})

// Axios response interceptor to handle specific HTTP errors centrally
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			console.error('Unauthorized: 401 error')
			return Promise.reject(new Error('unauthorized'))
		}
		return Promise.reject(error)
	}
)

/**
 * Retrieves information for multiple users by their IDs.
 * @async
 * @param {Object} params - Parameters for getting users.
 * @param {Array<string>} params.userIds - Array of user IDs to retrieve.
 * @returns {Promise<Object>} The response data containing user information.
 * @throws Will throw an error if the request fails.
 */
exports.getUsers = async ({ userIds }) => {
	try {
		const url = apiEndpoints.GET_USERS_INTERNAL
		const body = { userIds }
		console.log(body, 'body', url)
		const response = await apiClient.post(url, body)
		console.log('response', response.data)
		return response.data.data.users
	} catch (err) {
		console.error('Get users error:', err.message)
		throw err
	}
}
