var supertest = require('supertest') //require supertest
var defaults = require('superagent-defaults')
const { faker } = require('@faker-js/faker')
const crypto = require('crypto')
// const common = require('@constants/common')
let baseURLUser = 'http://localhost:3569'
let baseURL = 'http://localhost:3000'

const waitOn = require('wait-on')
let defaultHeaders

// Improved waitForService function
const waitForService = async (url) => {
	console.log(`Waiting for service at: ${url}`)
	const opts = {
		resources: [url],
		delay: 5000, // Initial delay before checking
		interval: 1000, // Interval between checks
		timeout: 60000, // Max time to wait for service
	}
	try {
		await waitOn(opts)
		console.log(`Service is ready at: ${url}`)
	} catch (error) {
		console.error(`Error: ${error.message}`)
		throw new Error('Service not available')
	}
}

// Function to log in and generate token
const userlogIn = async () => {
	try {
		console.log('============>ATTEMPTING LOGIN : ')

		// Define a separate request instance scoped to this function

		let requestUser = defaults(supertest(baseURLUser))

		// await waitForService(baseURLUser)

		// await waitForService(baseURL);

		jest.setTimeout(10000)

		// Generate unique email for testing
		let email = 'adithya.d' + crypto.randomBytes(5).toString('hex') + '@pacewisdom.com'
		let password = 'Welco@Me#123!'

		console.log(' email : -=-=-=-=-=>>  ', email)

		// Create a new account
		let res = await requestUser.post('/interface/v1/account/create').send({
			name: 'adithya',
			email: email,
			password: password,
		})

		// Log in with the created account
		res = await requestUser.post('/interface/v1/account/login').send({
			email: email,
			password: password,
		})
		console.log('-=-=-=-=-=>>  login response ', res.body)
		// Check if login was successful and return token details
		if (res.body?.result?.access_token && res.body.result.user.id) {
			console.log('============>LOGIN SUCCESSFUL', res.body.result.access_token)
			defaultHeaders = {
				'X-auth-token': 'bearer ' + res.body.result.access_token,
				Connection: 'keep-alive',
				'Content-Type': 'application/json',
			}

			global.request = defaults(supertest(baseURL))
			global.request.set(defaultHeaders)
			global.userId = res.body.result.user.id
			return {
				id: res.body.result.user.id,
				token: res.body.result.access_token,
				email: email,
				password: password,
				name: res.body.result.user.name,
				roles: res.body.result.user.user_roles,
				organization_id: res.body.result.user.organization_id,
			}
		} else {
			console.error('LOGIN FAILED')
			return false
		}
	} catch (error) {
		console.error('ERROR : : :', error)
	}
}

// Function to log any errors if they occur
function logError(res) {
	let successCodes = [200, 201, 202]
	if (!successCodes.includes(res.statusCode)) {
		console.log('Response Body', res.body)
	}
}

module.exports = {
	userlogIn,
	// logIn, //-- export if token is generated
	logError,
}
