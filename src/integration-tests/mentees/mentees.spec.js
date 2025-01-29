/**
 * name : entity.spec.js
 * author : Nevil
 * created-date : 14-Oct-2022
 * Description : Integration test for entity controllers.
 */

const commonHelper = require('@commonTests')
const schema = require('./responseSchema')
let loginInfo

jest.setTimeout(10000)
// describe('mentoring/v1/mentees', function () {
// 	beforeAll(async () => {
// 		loginInfo = await commonHelper.userlogIn()
// 	})

// 	it('/list - with email', async () => {

// 		let res = await request.post('/mentoring/v1/mentees/list' + '?page=1&limit=100&email=' + loginInfo.email)

// 		console.log("res ============",JSON.stringify(res.body));
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.menteeListSchema)
// 	})

// 	it('/list - with name', async () => {
// 		let res = await request.post('/mentoring/v1/mentees/list' + '?page=1&limit=100&name=' + loginInfo.firstname)

// 		console.log("res with ane ============",res.body);
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.menteeListSchema)
// 	})

// 	async function createUser(){
// 		let resp = await request.post('/mentoring/v1/profile/create').send({
// 			designation: ['beo', 'deo', 'testt'],
// 			area_of_expertise: ['educational_leadership', 'sqaa'],
// 			education_qualification: 'MBA',
// 			tags: ['Experienced', 'Technical'],
// 			visibility: 'visible',
// 			organisation_ids: [1],
// 			external_session_visibility: 'CURRENT',
// 			external_mentor_visibility: 'ALL',
// 		})
// 		console.log("--------  create profile resp ",resp);
// 	}
// })
