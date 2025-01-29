const commonHelper = require('@commonTests')
const schema = require('./responseSchema')
jest.setTimeout(10000)

const { faker } = require('@faker-js/faker')

describe('Module APIs ', function () {
	let userDetails
	let code = faker.random.alpha(5)

	beforeAll(async () => {
		try {
			userDetails = await commonHelper.userlogIn()
			console.log('Logged in User:', userDetails.id, userDetails.roles)
		} catch (error) {
			console.error('Error in beforeAll setup:', error)
			throw error // Ensure the error is thrown to fail the tests
		}
	})
	it('/create', async () => {
		let res = await request.post('/mentoring/v1/modules/create').send({
			code: code,
		})

		console.log('----- resp --', JSON.stringify(res.body))
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})

	it('/update', async () => {
		let moduleCode = faker.random.alpha(5)
		let moduleCreate = await request.post('/mentoring/v1/modules/create').send({
			code: moduleCode,
		})

		console.log('moduleCreate', moduleCreate.body.result)

		let res = await request.post('/mentoring/v1/modules/update/' + moduleCreate.body.result.Id).send({
			code: moduleCode,
			module: 'test',
		})

		console.log('----- resp --', JSON.stringify(res.body))
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})

	it('/delete', async () => {
		let moduleCreate = await request.post('/mentoring/v1/modules/create').send({
			code: faker.random.alpha(5),
		})

		let res = await request.delete('/mentoring/v1/modules/delete/' + moduleCreate.body.result.Id)
		expect(res.statusCode).toBe(202)
	})

	it('/list', async () => {
		let res = await request.get('/mentoring/v1/modules/list').query({ page: 1, limit: 10, code: 'cw==' })
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.listSchema)
	})
})
