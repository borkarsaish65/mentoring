/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const schema = require('./responseSchema')

jest.setTimeout(10000)

// describe('mentoring/v1/mentors ', function () {
// 	let userDetails
// 	beforeAll(async () => {
// 		userDetails = await commonHelper.userlogIn();
// 	})
// 	it('/reports', async () => {
// 		let res = await request.get('/mentoring/v1/mentors/reports').query({ filterType: 'QUARTERLY' })
// 		//console.log(res.body)
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.reportsSchema)
// 	})
// 	it('/profile', async () => {

// 		let res = await request.get('/mentoring/v1/mentors/details/' + userDetails.id)
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.profileSchema)
// 	})

// 	it('/mentorList', async () => {

// 		let res = await request.get('/mentoring/v1/mentors/list')
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.mentorsList)
// 	})
// 	it('/upcomingSessions', async () => {

// 		let listResp = await request.get('/mentoring/v1/mentors/list')
// 		console.log("listResp ---",JSON.stringify(listResp.body));

// 		const userId = listResp.body.result?.data?.[0].id;

// 		let res = await request.get('/mentoring/v1/mentors/upcomingSessions/' + userId)

// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.upcomingSessionsSchema)
// 	})

// 	it('/share', async () => {

// 		let res = await request.get('/mentoring/v1/mentors/share/' + userDetails.id)
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.shareSchema)
// 	})

// 	it('/createdSessions', async () => {

// 		let res = await request.post('/mentoring/v1/mentors/createdSessions').send({ status:"PUBLISHED,COMPLETED" })
// 		console.log(" ---------",res.body)
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.shareSchema)
// 	})
// })
