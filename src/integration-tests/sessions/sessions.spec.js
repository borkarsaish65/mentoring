/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const schema = require('./responseSchema')
const moment = require('moment-timezone')

jest.setTimeout(10000)

describe('mentor flow - mentoring/v1/sessions', function () {
	beforeAll(async () => {
		await commonHelper.userlogIn()
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/sessions/update').send(generateSessionBody())

		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})
	// it('/delete', async () => {
	// 	let sessionId = await sessionsData.insertSession()
	// 	let res = await request.delete('/mentoring/v1/sessions/update/' + sessionId)

	// 	//console.log(res.body)
	// 	expect(res.statusCode).toBe(202)
	// 	expect(res.body).toMatchSchema(schema.deleteSchema)
	// })
	// it('/update', async () => {
	// 	let sessionId = await sessionsData.insertSession()
	// 	let res = await request
	// 		.post('/mentoring/v1/sessions/update/' + sessionId)
	// 		.send({ startDate: Math.floor(Date.now()) + 6000, endDate: Math.floor(Date.now()) + 8000 })

	// 	//console.log(res.body)
	// 	expect(res.statusCode).toBe(202)
	// 	expect(res.body).toMatchSchema(schema.updateSchema)
	// })
	it('/start', async () => {
		await commonHelper.userlogIn()
		let session = await createSession()
		let res = await request.get('/mentoring/v1/sessions/start/' + session.body.result.id)
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.startSchema)
	})
	it('/list', async () => {
		await createSession()
		let res = await request.get('/mentoring/v1/sessions/list')
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.listSchema)
	})
	it('/details', async () => {
		await commonHelper.userlogIn()
		let session = await createSession()
		let res = await request.get('/mentoring/v1/sessions/details/' + session.body.result.id)

		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.detailsSchema)
	})
	it('/share', async () => {
		await commonHelper.userlogIn()
		let session = await createSession()
		let res = await request.get('/mentoring/v1/sessions/share/' + session.body.result.id)
		//console.log(res.body)

		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.shareSchema)
	})
	it('/completed', async () => {
		await commonHelper.userlogIn()
		let session = await createSession()
		let res = await request.get('/mentoring/v1/sessions/completed/' + session.body.result.id)
		console.log('---------------- completed ------', res.body)

		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.completedSchema)
	})

	// it('/updateRecordingUrl', async () => {
	// 	await sessionsData.insertSession(false, 'published', true)
	// 	let res = await request
	// 		.patch('/mentoring/v1/sessions/updateRecordingUrl/c321be68f93837188a2e8a8cb679d217a24c18b7-1657692090254')
	// 		.send({
	// 			recordingUrl: 'www.test.com',
	// 		})
	// 	//console.log(res.body)
	// 	expect(res.statusCode).toBe(200)
	// 	expect(res.body).toMatchSchema(schema.updateSchema)
	// })
})

describe('mentee flow-mentoring/v1/sessions', function () {
	beforeAll(async () => {
		await commonHelper.userlogIn()
	})
	let sessionIdForUnenroll
	it('/enroll ', async () => {
		let session = await createSession()
		let res = await request.post('/mentoring/v1/sessions/enroll/' + session.body.result.id)
		sessionIdForUnenroll = session.body.result.id
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.enrollSchema)
	})
	it('/unEnroll', async () => {
		await commonHelper.userlogIn()
		let session = await createSession()
		let sessionId = session.body.result.id
		let enrollResponse = await request.post('/mentoring/v1/sessions/enroll/' + sessionId)
		let res = await request.post('/mentoring/v1/sessions/unEnroll/' + sessionId)

		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.unenrollSchema)
	})
})
function generateSessionBody() {
	const startDate = moment()

	// Add 30 minutes to the current time for the end date
	const endDate = moment().add(35, 'minutes')

	// Get epoch times
	const startEpoch = startDate.unix() // in seconds
	const endEpoch = endDate.unix() // in seconds

	let body = {
		title: faker.random.alpha(5),
		description: faker.lorem.sentence(),
		// startDate: Math.floor(Date.now()) + 600,
		// endDate: Math.floor(Date.now()) + 4200,

		start_date: startEpoch,
		end_date: endEpoch,
		recommended_for: ['deo'],
		meeting_info: {
			platform: 'Google meet',
			link: 'https://meet.google.com/iyg-tgir-yiv?authuser=0',
			value: 'Gmeet',
		},
		categories: ['educational_leadership'],
		medium: ['en_in'],
		time_zone: 'Asia/Calcutta',
		image: ['users/1232s2133sdd1.png'],
	}
	return body
}
async function createSession() {
	let body = generateSessionBody()
	let res = await request.post('/mentoring/v1/sessions/update').send(body)

	return res
}
