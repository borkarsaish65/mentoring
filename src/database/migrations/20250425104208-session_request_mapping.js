'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('session_request_mapping', {
			requestee_id: {
				type: Sequelize.STRING,
				allowNull: false,
				primaryKey: true,
			},
			session_request_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
			},
		})
		await queryInterface.addIndex('session_request_mapping', ['requestee_id'], {
			name: 'index_requestee_id_session_request_mapping',
		})

		// For multi-column index
		await queryInterface.addIndex('session_request_mapping', ['session_request_id', 'requestee_id'], {
			name: 'index_requestee_id_session_request_id_session_request_mapping',
			unique: true, // Optional: use if (requestor_id + requestee_id) must be unique
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeIndex('session_request_mapping', 'index_requestee_id_session_request_mapping')
		await queryInterface.removeIndex(
			'session_request_mapping',
			'index_requestee_id_session_request_id_session_request_mapping'
		)
	},
}
