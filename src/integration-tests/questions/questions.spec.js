/**
 * name : form.spec.js
 * author : Nevil
 * created-date : 16-Oct-2022
 * Description : Integration test for form controllers.
 */

const commonHelper = require('@commonTests')
const { faker } = require('@faker-js/faker')
const schema = require('./responseSchema')

describe('mentoring/v1/questions', function () {
	beforeAll(async () => {
		await commonHelper.userlogIn()
	})
	it('/create', async () => {
		let res = await createQuestion()
		expect(res.statusCode).toBe(201)
		expect(res.body).toMatchSchema(schema.createSchema)
	})
	it('/read', async () => {
		let createdQuestions = await createQuestion()
		let res = await request.get('/mentoring/v1/questions/read/' + createdQuestions.body.result.id)
		//console.log(res.body)
		console.log(' ---------------  -----', JSON.stringify(res.body))
		expect(res.statusCode).toBe(200)
		expect(res.body).toMatchSchema(schema.readSchema)
	})
	it('/update', async () => {
		let createdQuestions = await createQuestion()
		let res = await request.post('/mentoring/v1/questions/update/' + createdQuestions.body.result.id).send({
			question: faker.lorem.sentence(),
		})
		//console.log(res.body)

		expect(res.statusCode).toBe(202)
		expect(res.body).toMatchSchema(schema.updateSchema)
	})
})

async function createQuestion() {
	let res = await request.post('/mentoring/v1/questions/create').send({
		name: faker.random.alpha(5),
		question: faker.lorem.sentence(),
		options: null,
		type: 'rating',
		rendering_data: {
			value: '',
			class: 'ion-margin',
			disabled: false,
			noOfstars: '5',
			position: 'floating',
			validation: {
				required: false,
			},
		},
		no_of_stars: 5,
		status: 'active',
	})
	return res
}
