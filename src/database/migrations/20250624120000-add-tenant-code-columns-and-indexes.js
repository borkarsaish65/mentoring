'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			// Add tenant_code column to all tables (except permissions and role_permission_mapping)
			const tablesToAddTenantCode = [
				'availabilities',
				'connection_requests',
				'connections',
				'default_rules',
				'entities',
				'entity_types',
				'feedbacks',
				'file_uploads',
				'forms',
				'issues',
				'modules',
				'notification_templates',
				'organization_extension',
				'question_sets',
				'questions',
				'report_queries',
				'report_role_mapping',
				'report_types',
				'reports',
				'resources',
				'role_extensions',
				'session_attendees',
				'session_request',
				'sessions',
				'user_extensions',
			]

			// Add tenant_code to all specified tables
			for (const tableName of tablesToAddTenantCode) {
				await queryInterface.addColumn(
					tableName,
					'tenant_code',
					{
						type: Sequelize.STRING,
						allowNull: true,
					},
					{ transaction }
				)
			}

			// Add organization_id to issues table
			await queryInterface.addColumn(
				'issues',
				'organization_id',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Add organization_code to organization_extension table
			await queryInterface.addColumn(
				'organization_extension',
				'organization_code',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Add organization_id to question_sets table
			await queryInterface.addColumn(
				'question_sets',
				'organization_id',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Add organization_id to questions table
			await queryInterface.addColumn(
				'questions',
				'organization_id',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Add organization_code to report_queries table
			await queryInterface.addColumn(
				'report_queries',
				'organization_code',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Add organization_id to report_role_mapping table
			await queryInterface.addColumn(
				'report_role_mapping',
				'organization_id',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Add organization_id to report_types table
			await queryInterface.addColumn(
				'report_types',
				'organization_id',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Add organization_id and user_name to user_extensions table
			await queryInterface.addColumn(
				'user_extensions',
				'organization_id',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			await queryInterface.addColumn(
				'user_extensions',
				'user_name',
				{
					type: Sequelize.STRING,
					allowNull: true,
				},
				{ transaction }
			)

			// Drop existing primary keys and add composite primary keys
			const primaryKeyUpdates = [
				{
					table: 'availabilities',
					dropConstraint: 'availabilities_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'connection_requests',
					dropConstraint: 'connection_requests_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'connections',
					dropConstraint: 'connections_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'default_rules',
					dropConstraint: 'default_rules_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'entities',
					dropConstraint: 'entities_pkey',
					newPrimaryKey: ['tenant_code', 'id', 'entity_type_id'],
				},
				{
					table: 'entity_types',
					dropConstraint: 'entity_types_pkey',
					newPrimaryKey: ['tenant_code', 'organization_id', 'id'],
				},
				{
					table: 'feedbacks',
					dropConstraint: 'feedbacks_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'file_uploads',
					dropConstraint: 'file_uploads_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'forms',
					dropConstraint: 'forms_pkey',
					newPrimaryKey: ['tenant_code', 'id', 'organization_id'],
				},
				{
					table: 'issues',
					dropConstraint: 'issues_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'modules',
					dropConstraint: 'modules_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'notification_templates',
					dropConstraint: 'notification_templates_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'organization_extension',
					dropConstraint: 'organization_extension_pkey',
					newPrimaryKey: ['tenant_code', 'organization_code', 'id'],
				},
				{
					table: 'question_sets',
					dropConstraint: 'question_sets_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'questions',
					dropConstraint: 'questions_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'report_queries',
					dropConstraint: 'report_queries_pkey',
					newPrimaryKey: ['tenant_code', 'id', 'organization_code'],
				},
				{
					table: 'report_role_mapping',
					dropConstraint: 'report_role_mapping_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'report_types',
					dropConstraint: 'report_types_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'reports',
					dropConstraint: 'reports_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'resources',
					dropConstraint: 'resources_pkey',
					newPrimaryKey: ['tenant_code', 'id'],
				},
				{
					table: 'role_extensions',
					dropConstraint: 'role_extensions_pkey',
					newPrimaryKey: ['tenant_code', 'title'],
				},
				{
					table: 'sessions',
					dropConstraint: 'sessions_pkey',
					newPrimaryKey: ['tenant_code'],
				},
				{
					table: 'user_extensions',
					dropConstraint: 'user_extensions_pkey',
					newPrimaryKey: ['tenant_code', 'user_id'],
				},
			]

			// Update primary keys
			for (const pkUpdate of primaryKeyUpdates) {
				// Drop existing primary key constraint
				try {
					await queryInterface.removeConstraint(pkUpdate.table, pkUpdate.dropConstraint, { transaction })
				} catch (error) {
					// Constraint might not exist or have different name, continue
				}

				// Add new composite primary key
				await queryInterface.addConstraint(pkUpdate.table, {
					fields: pkUpdate.newPrimaryKey,
					type: 'primary key',
					name: `${pkUpdate.table}_pkey`,
					transaction,
				})
			}

			// Add unique constraints as specified
			const uniqueConstraints = [
				{
					table: 'entity_types',
					fields: ['value', 'organization_id', 'tenant_code'],
					name: 'entity_types_value_org_tenant_unique',
				},
				{
					table: 'forms',
					fields: ['tenant_code', 'id', 'organization_id', 'type'],
					name: 'forms_tenant_id_org_type_unique',
				},
				{
					table: 'notification_templates',
					fields: ['code', 'organization_id', 'tenant_code'],
					name: 'notification_templates_code_org_tenant_unique',
				},
				{
					table: 'organization_extension',
					fields: ['organization_code'],
					name: 'organization_extension_org_code_unique',
				},
				{
					table: 'report_types',
					fields: ['title'],
					name: 'report_types_title_unique',
				},
				{
					table: 'reports',
					fields: ['code', 'tenant_code', 'organization_id'],
					name: 'reports_code_tenant_org_unique',
				},
				{
					table: 'role_extensions',
					fields: ['title', 'organization_id', 'tenant_code'],
					name: 'role_extensions_title_org_tenant_unique',
				},
				{
					table: 'user_extensions',
					fields: ['user_id', 'tenant_code'],
					name: 'user_extensions_user_tenant_unique',
				},
			]

			for (const constraint of uniqueConstraints) {
				await queryInterface.addConstraint(constraint.table, {
					fields: constraint.fields,
					type: 'unique',
					name: constraint.name,
					transaction,
				})
			}

			// Create indexes as specified
			const indexDefinitions = [
				{ table: 'availabilities', fields: ['tenant_code'], name: 'idx_availabilities_tenant_code' },
				{
					table: 'connection_requests',
					fields: ['friend_id', 'user_id', 'tenant_code'],
					name: 'idx_connection_requests_friend_user_tenant',
				},
				{
					table: 'connections',
					fields: ['friend_id', 'user_id', 'tenant_code'],
					name: 'idx_connections_friend_user_tenant',
				},
				{
					table: 'default_rules',
					fields: ['type', 'organization_id', 'tenant_code'],
					name: 'idx_default_rules_type_org_tenant',
				},
				{
					table: 'entities',
					fields: ['entity_type_id', 'tenant_code'],
					name: 'idx_entities_entity_type_tenant',
				},
				{ table: 'entity_types', fields: ['value', 'tenant_code'], name: 'idx_entity_types_value_tenant' },
				{ table: 'feedbacks', fields: ['user_id', 'tenant_code'], name: 'idx_feedbacks_user_tenant' },
				{
					table: 'file_uploads',
					fields: ['organization_id', 'tenant_code'],
					name: 'idx_file_uploads_org_tenant',
				},
				{ table: 'forms', fields: ['type', 'sub_type', 'organization_id'], name: 'idx_forms_type_subtype_org' },
				{ table: 'issues', fields: ['tenant_code'], name: 'idx_issues_tenant_code' },
				{ table: 'modules', fields: ['code'], name: 'idx_modules_code' },
				{
					table: 'notification_templates',
					fields: ['code', 'organization_id'],
					name: 'idx_notification_templates_code_org',
				},
				{
					table: 'organization_extension',
					fields: ['organization_code', 'tenant_code', 'organization_code'],
					name: 'idx_org_ext_org_code_tenant_org_code',
				},
				{
					table: 'post_session_details',
					fields: ['session_id', 'tenant_code'],
					name: 'idx_post_session_details_session_tenant',
				},
				{ table: 'question_sets', fields: ['code', 'tenant_code'], name: 'idx_question_sets_code_tenant' },
				{
					table: 'report_queries',
					fields: ['report_code', 'tenant_code', 'organization_code'],
					name: 'idx_report_queries_code_tenant_org_code',
				},
				{
					table: 'report_role_mapping',
					fields: ['role_title', 'report_code'],
					name: 'idx_report_role_mapping_role_report',
				},
				{ table: 'report_types', fields: ['title', 'tenant_code'], name: 'idx_report_types_title_tenant' },
				{
					table: 'reports',
					fields: ['organization_id', 'tenant_code', 'code'],
					name: 'idx_reports_org_tenant_code',
				},
				{ table: 'resources', fields: ['session_id', 'tenant_code'], name: 'idx_resources_session_tenant' },
				{ table: 'role_extensions', fields: ['title'], name: 'idx_role_extensions_title' },
				{
					table: 'role_permission_mapping',
					fields: ['role_title', 'module', 'request_type', 'tenant_code'],
					name: 'idx_role_permission_mapping_role_module_request_tenant',
				},
				{
					table: 'session_attendees',
					fields: ['session_id', 'mentee_id', 'tenant_code'],
					name: 'idx_session_attendees_session_mentee_tenant',
				},
				{
					table: 'session_request',
					fields: ['requestor_id', 'requestee_id', 'tenant_code'],
					name: 'idx_session_request_requestor_requestee_tenant',
				},
				{
					table: 'sessions',
					fields: ['id', 'title', 'mentor_name', 'created_by'],
					name: 'idx_sessions_id_title_mentor_creator',
				},
				{
					table: 'user_extensions',
					fields: ['user_id', 'tenant_code', 'email', 'phone', 'user_name'],
					name: 'idx_user_extensions_user_tenant_contact',
				},
			]

			for (const index of indexDefinitions) {
				await queryInterface.addIndex(index.table, index.fields, {
					name: index.name,
					transaction,
				})
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
			// Remove all indexes
			const indexesToRemove = [
				'idx_availabilities_tenant_code',
				'idx_connection_requests_friend_user_tenant',
				'idx_connections_friend_user_tenant',
				'idx_default_rules_type_org_tenant',
				'idx_entities_entity_type_tenant',
				'idx_entity_types_value_tenant',
				'idx_feedbacks_user_tenant',
				'idx_file_uploads_org_tenant',
				'idx_forms_type_subtype_org',
				'idx_issues_tenant_code',
				'idx_modules_code',
				'idx_notification_templates_code_org',
				'idx_org_ext_org_code_tenant_org_code',
				'idx_post_session_details_session_tenant',
				'idx_question_sets_code_tenant',
				'idx_report_queries_code_tenant_org_code',
				'idx_report_role_mapping_role_report',
				'idx_report_types_title_tenant',
				'idx_reports_org_tenant_code',
				'idx_resources_session_tenant',
				'idx_role_extensions_title',
				'idx_role_permission_mapping_role_module_request_tenant',
				'idx_session_attendees_session_mentee_tenant',
				'idx_session_request_requestor_requestee_tenant',
				'idx_sessions_id_title_mentor_creator',
				'idx_user_extensions_user_tenant_contact',
			]

			for (const indexName of indexesToRemove) {
				try {
					await queryInterface.removeIndex(null, indexName, { transaction })
				} catch (error) {
					// Index may not exist, continue
				}
			}

			// Remove unique constraints
			const constraintsToRemove = [
				{ table: 'entity_types', name: 'entity_types_value_org_tenant_unique' },
				{ table: 'forms', name: 'forms_tenant_id_org_type_unique' },
				{ table: 'notification_templates', name: 'notification_templates_code_org_tenant_unique' },
				{ table: 'organization_extension', name: 'organization_extension_org_code_unique' },
				{ table: 'report_types', name: 'report_types_title_unique' },
				{ table: 'reports', name: 'reports_code_tenant_org_unique' },
				{ table: 'role_extensions', name: 'role_extensions_title_org_tenant_unique' },
				{ table: 'user_extensions', name: 'user_extensions_user_tenant_unique' },
			]

			for (const constraint of constraintsToRemove) {
				try {
					await queryInterface.removeConstraint(constraint.table, constraint.name, { transaction })
				} catch (error) {
					// Constraint may not exist, continue
				}
			}

			// Restore original primary keys (drop composite, add single id)
			const originalPrimaryKeys = [
				'availabilities',
				'connection_requests',
				'connections',
				'default_rules',
				'entities',
				'entity_types',
				'feedbacks',
				'file_uploads',
				'forms',
				'issues',
				'modules',
				'notification_templates',
				'organization_extension',
				'question_sets',
				'questions',
				'report_queries',
				'report_role_mapping',
				'report_types',
				'reports',
				'resources',
				'role_extensions',
				'sessions',
				'user_extensions',
			]

			for (const table of originalPrimaryKeys) {
				try {
					await queryInterface.removeConstraint(table, `${table}_pkey`, { transaction })
					await queryInterface.addConstraint(table, {
						fields: ['id'],
						type: 'primary key',
						name: `${table}_pkey`,
						transaction,
					})
				} catch (error) {
					// Continue if constraint operations fail
				}
			}

			// Remove all added columns
			const tablesToRemoveTenantCode = [
				'availabilities',
				'connection_requests',
				'connections',
				'default_rules',
				'entities',
				'entity_types',
				'feedbacks',
				'file_uploads',
				'forms',
				'issues',
				'modules',
				'notification_templates',
				'organization_extension',
				'question_sets',
				'questions',
				'report_queries',
				'report_role_mapping',
				'report_types',
				'reports',
				'resources',
				'role_extensions',
				'session_attendees',
				'session_request',
				'sessions',
				'user_extensions',
			]

			for (const tableName of tablesToRemoveTenantCode) {
				await queryInterface.removeColumn(tableName, 'tenant_code', { transaction })
			}

			// Remove additional columns
			await queryInterface.removeColumn('issues', 'organization_id', { transaction })
			await queryInterface.removeColumn('organization_extension', 'organization_code', { transaction })
			await queryInterface.removeColumn('question_sets', 'organization_id', { transaction })
			await queryInterface.removeColumn('questions', 'organization_id', { transaction })
			await queryInterface.removeColumn('report_queries', 'organization_code', { transaction })
			await queryInterface.removeColumn('report_role_mapping', 'organization_id', { transaction })
			await queryInterface.removeColumn('report_types', 'organization_id', { transaction })
			await queryInterface.removeColumn('user_extensions', 'organization_id', { transaction })
			await queryInterface.removeColumn('user_extensions', 'user_name', { transaction })

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
}
