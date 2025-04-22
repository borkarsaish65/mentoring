'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('entity_types', 'request_session', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		})

		await queryInterface.sequelize.query('UPDATE entity_types SET request_session = false;')
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('entity_types', 'request_session')
	},
}
