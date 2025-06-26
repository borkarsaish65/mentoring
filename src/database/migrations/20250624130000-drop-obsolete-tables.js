'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			// Tables to be dropped as per updated specification (marked as "delete table")
			const tablesToDrop = [
				{
					name: 'session_enrollments',
					reason: 'Replaced by session_attendees table',
				},
				{
					name: 'session_ownerships',
					reason: 'Ownership logic moved to sessions table',
				},
				{
					name: 'session_request_mapping',
					reason: 'Simplified request handling - functionality integrated into session_request',
				},
			]

			// Drop each table with enhanced error handling
			for (const tableInfo of tablesToDrop) {
				try {
					// First check if table exists
					const [results] = await queryInterface.sequelize.query(
						`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableInfo.name}';`,
						{ transaction }
					)

					if (results.length > 0) {
						// Table exists, drop it
						await queryInterface.dropTable(tableInfo.name, { transaction })
					} else {
						// Table doesn't exist, skip silently
						continue
					}
				} catch (error) {
					// Enhanced error checking for different database systems
					const tableNotExistErrors = [
						'does not exist',
						"doesn't exist",
						'relation',
						'unknown table',
						'no such table',
						'table or view does not exist',
					]

					const isTableNotExistError = tableNotExistErrors.some((errorMsg) =>
						error.message.toLowerCase().includes(errorMsg.toLowerCase())
					)

					if (isTableNotExistError) {
						// Table doesn't exist, continue with next table
						continue
					} else {
						// Other error, re-throw
						throw error
					}
				}
			}

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			// Recreate session_enrollments table with original structure
			await queryInterface.createTable(
				'session_enrollments',
				{
					id: {
						type: Sequelize.INTEGER,
						primaryKey: true,
						autoIncrement: true,
						allowNull: false,
					},
					mentee_id: {
						type: Sequelize.STRING,
						allowNull: false,
					},
					session_id: {
						type: Sequelize.INTEGER,
						allowNull: false,
					},
					created_at: {
						type: Sequelize.DATE,
						allowNull: false,
						defaultValue: Sequelize.NOW,
					},
					updated_at: {
						type: Sequelize.DATE,
						allowNull: false,
						defaultValue: Sequelize.NOW,
					},
					deleted_at: {
						type: Sequelize.DATE,
						allowNull: true,
					},
				},
				{ transaction }
			)

			// Recreate session_ownerships table with original structure
			await queryInterface.createTable(
				'session_ownerships',
				{
					id: {
						type: Sequelize.INTEGER,
						primaryKey: true,
						autoIncrement: true,
						allowNull: false,
					},
					user_id: {
						type: Sequelize.STRING,
						allowNull: false,
					},
					session_id: {
						type: Sequelize.INTEGER,
						allowNull: false,
					},
					type: {
						type: Sequelize.STRING,
						allowNull: true,
					},
					created_at: {
						type: Sequelize.DATE,
						allowNull: false,
						defaultValue: Sequelize.NOW,
					},
					updated_at: {
						type: Sequelize.DATE,
						allowNull: false,
						defaultValue: Sequelize.NOW,
					},
					deleted_at: {
						type: Sequelize.DATE,
						allowNull: true,
					},
				},
				{ transaction }
			)

			// Recreate session_request_mapping table with original structure
			await queryInterface.createTable(
				'session_request_mapping',
				{
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
				},
				{ transaction }
			)

			// Recreate essential indexes that would have existed on these tables

			// session_enrollments indexes
			await queryInterface.addIndex('session_enrollments', ['mentee_id'], {
				name: 'idx_session_enrollments_mentee_id',
				transaction,
			})
			await queryInterface.addIndex('session_enrollments', ['mentee_id', 'session_id'], {
				name: 'idx_session_enrollments_mentee_session',
				transaction,
			})
			await queryInterface.addIndex('session_enrollments', ['session_id'], {
				name: 'idx_session_enrollments_session_id',
				transaction,
			})

			// session_ownerships indexes
			await queryInterface.addIndex('session_ownerships', ['user_id'], {
				name: 'idx_session_ownerships_user_id',
				transaction,
			})
			await queryInterface.addIndex('session_ownerships', ['session_id'], {
				name: 'idx_session_ownerships_session_id',
				transaction,
			})
			await queryInterface.addIndex('session_ownerships', ['type', 'session_id', 'user_id'], {
				name: 'idx_session_ownerships_type_session_user',
				transaction,
			})

			// session_request_mapping indexes
			await queryInterface.addIndex('session_request_mapping', ['requestee_id'], {
				name: 'idx_session_request_mapping_requestee_id',
				transaction,
			})
			await queryInterface.addIndex('session_request_mapping', ['session_request_id'], {
				name: 'idx_session_request_mapping_session_request_id',
				transaction,
			})

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
}
