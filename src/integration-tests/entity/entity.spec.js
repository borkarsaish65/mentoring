const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const schema = require('./responseSchema')
jest.setTimeout(10000)

describe('Entity APIs', function () {
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

	it('Read Entity', async () => {
		const res = await request.post('/mentoring/v1/entity/read/5')

		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.listSchema)
	})

	it('Create Entity', async () => {
		//Get entity type id

		// const createEntityType = await request.post('/mentoring/v1/entity-type/create').send({
		//     value: 'new_entity_type',
		// 	label: 'New Entity Type',
		// 	type: 'SYSTEM',
		// 	allow_filtering: false,
		// 	data_type: 'STRING',
		// 	has_entities: true,
		//     model_names:["UserExtension"]

		// })
		// console.log("createEntityType",createEntityType.body);

		// const readEntityType = await request.post('/mentoring/v1/entity-type/read')

		// console.log("readEntityType",readEntityType.body);
		const entityTypeId = '2'
		let res = await request.post('/mentoring/v1/entity/create').send(createEntityData(entityTypeId))

		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})

	it('Update Entity', async () => {
		const entityTypeId = '2'
		let createdEntity = await request.post('/mentoring/v1/entity/create').send(createEntityData(entityTypeId))

		const entityId = createdEntity.body?.result?.id
		const res = await request.post('/mentoring/v1/entity/update/' + entityId).send({
			status: 'ACTIVE',
		})

		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})

	it('Delete Entity', async () => {
		const res = await request.delete('/mentoring/v1/entities/delete/999')
		expect(res.statusCode).toBe(401)
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
