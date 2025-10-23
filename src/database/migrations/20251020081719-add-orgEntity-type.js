module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const entitiesArray = {
			organization: {
				sequence: 1,
			},
			about: {
				sequence: 2,
			},
		}

		const entityTypeFinalArray = Object.keys(entitiesArray).map((key) => {
			const entityTypeRow = {
				value: key,
				label: convertToWords(key),
				data_type: 'STRING',
				status: 'ACTIVE',
				updated_at: new Date(),
				created_at: new Date(),
				created_by: 0,
				updated_by: 0,
				allow_filtering: false,
				organization_id: defaultOrgId,
				has_entities: false,
				meta: JSON.stringify({
					label: convertToWords(key),
					visible: true,
					visibility: 'main',
					sequence: entitiesArray[key].sequence,
				}),
			}

			entityTypeRow.model_names = ['UserExtension']
			return entityTypeRow
		})

		console.log('entityTypeFinalArray', entityTypeFinalArray)
		await queryInterface.bulkInsert('entity_types', entityTypeFinalArray, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('entity_types', { value: 'organization' }, {})
		await queryInterface.bulkDelete('entity_types', { value: 'about' }, {})
	},
}

function convertToWords(inputString) {
	const words = inputString.replace(/_/g, ' ').split(' ')

	const capitalizedWords = words.map((word) => {
		return word.charAt(0).toUpperCase() + word.slice(1)
	})

	const result = capitalizedWords.join(' ')

	return result
}
