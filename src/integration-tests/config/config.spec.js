const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const schema = require('./responseSchema')

jest.setTimeout(10000)

describe('Config APIs', function () {
	let userDetails

	beforeAll(async () => {
		try {
			userDetails = await commonHelper.userlogIn()
			console.log('Logged in User:', userDetails.id, userDetails.roles)
		} catch (error) {
			console.error('Error in beforeAll setup:', error)
			throw error // Ensure the error is thrown to fail the tests
		}
	})

	it('Read Config', async () => {
		const res = await request.get('/mentoring/v1/platform/config')

		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.configList)
	})
})

function createEntityData(entityTypeId) {
	return {
		value: faker.random.alpha(5),
		label: faker.random.alpha(5),
		type: 'SYSTEM',
		entity_type_id: entityTypeId,
	}
}
