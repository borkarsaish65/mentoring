const commonHelper = require('@commonTests')
const schema = require('./responseSchema')
const { faker } = require('@faker-js/faker')
const { compareSync } = require('bcryptjs')

jest.setTimeout(10000)
// describe('mentoring/v1/permissions ', function () {
// 	let userDetails

// 	const permissionsCode = faker.random.alpha({ count: 10 });

// 	// Convert the string to a buffer and then encode it as base64
// 	const base64permissionCode = Buffer.from(permissionsCode).toString('base64');

// 	beforeAll(async () => {
// 		userDetails = await commonHelper.userlogIn()
// 		console.log('Logged in User: ROLE ======= ', userDetails.id, userDetails.roles)
// 	})
// 	it('/create', async () => {
// 		let res = await request.post('/mentoring/v1/permissions/create').send({
// 			code: permissionsCode,
// 			module: 'permissions',
// 			request_type: ['GET'],
// 			api_path: '/mentoring/v1/permissions/read',
// 			status: 'ACTIVE',
// 		})
// 		console.log("--------------- create response ",res.body)
// 		expect(res.statusCode).toBe(201)
// 		expect(res.body).toMatchSchema(schema.createSchema)
// 	})

// 	it('/update', async () => {

// 		let listDetails = await request
// 			.get('/mentoring/v1/permissions/list')
// 			.query({ page: 1, limit: 10, search:base64permissionCode })

// 		const id = listDetails.body.result?.results?.data?.[0]?.id;
// 		let res = await request.post('/mentoring/v1/permissions/update/'+id).send({
// 			code: permissionsCode,
// 			module: 'permissions',
// 			request_type: ['POST'],
// 			api_path: '/mentoring/v1/permissions/read',
// 			status: 'ACTIVE',
// 		})
// 		//console.log(res.body)
// 		expect(res.statusCode).toBe(201)
// 		expect(res.body).toMatchSchema(schema.updateSchema)
// 	})

// 	it('/list', async () => {
// 		let res = await request
// 			.get('/mentoring/v1/permissions/list')
// 			.query({ page: 1, limit: 10, search: base64permissionCode })

// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toMatchSchema(schema.listSchema)
// 	})

// 	it('/delete', async () => {

// 		let listDetails = await request
// 			.get('/mentoring/v1/permissions/list')
// 			.query({ page: 1, limit: 10, search:base64permissionCode })

// 		const id = listDetails.body.result?.results?.data?.[0]?.id;

// 		let res = await request.post('/mentoring/v1/permissions/delete/'+id)
// 		//console.log(res.body)
// 		expect(res.statusCode).toBe(202)
// 		expect(res.body).toMatchSchema(schema.deleteSchema)
// 	})
// })
