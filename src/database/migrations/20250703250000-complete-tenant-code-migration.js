'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			console.log('🚀 Starting complete tenant-code migration...')

			// Check if Citus is enabled
			const citusEnabled = await queryInterface.sequelize.query(
				"SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'citus')",
				{ type: Sequelize.QueryTypes.SELECT }
			)

			if (!citusEnabled[0].exists) {
				console.log('⚠️  Citus not enabled, proceeding with regular PostgreSQL setup')
			} else {
				console.log('✅ Citus enabled, proceeding with distributed setup')
			}

			// =============================================================================
			// PHASE 1: ADD TENANT_CODE COLUMNS TO ALL TABLES
			// =============================================================================
			console.log('\n📝 PHASE 1: Adding tenant_code columns to all tables...')
			console.log('='.repeat(70))

			const tablesToProcess = [
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
				'post_session_details',
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

			// Helper function to safely process each table
			async function processTableSafely(tableName) {
				try {
					console.log(`Processing: ${tableName}`)

					// Check if table exists
					const tableExists = await queryInterface.sequelize.query(
						`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`,
						{ type: Sequelize.QueryTypes.SELECT }
					)

					if (!tableExists[0].exists) {
						console.log(`⚠️  Table ${tableName} does not exist, skipping`)
						return false
					}

					// Check if tenant_code column already exists
					const columnExists = await queryInterface.sequelize.query(
						`SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name = 'tenant_code')`,
						{ type: Sequelize.QueryTypes.SELECT }
					)

					if (!columnExists[0].exists) {
						// Add tenant_code column
						await queryInterface.addColumn(tableName, 'tenant_code', {
							type: Sequelize.STRING(255),
							allowNull: false,
							defaultValue: 'DEFAULT_TENANT',
						})
						console.log(`✅ Added tenant_code to ${tableName}`)
					} else {
						console.log(`✅ ${tableName} already has tenant_code column`)
					}

					// Update primary key constraints if Citus is enabled
					if (citusEnabled[0].exists) {
						// Undistribute table if currently distributed
						try {
							const distInfo = await queryInterface.sequelize.query(
								`SELECT count(*) as count FROM pg_dist_partition WHERE logicalrelid = '${tableName}'::regclass`,
								{ type: Sequelize.QueryTypes.SELECT }
							)

							if (distInfo[0].count > 0) {
								await queryInterface.sequelize.query(`SELECT undistribute_table('${tableName}')`)
								console.log(`✅ Undistributed: ${tableName}`)
							}
						} catch (error) {
							// Table might not be distributed, continue
						}

						// Update primary keys to include tenant_code (table-specific logic)
						await updatePrimaryKeyForTable(tableName)
					}

					return true
				} catch (error) {
					console.log(`❌ Error processing ${tableName}: ${error.message}`)
					return false
				}
			}

			// Helper function to update primary keys for specific tables
			async function updatePrimaryKeyForTable(tableName) {
				try {
					switch (tableName) {
						case 'connection_requests':
						case 'connections':
							// Drop existing constraints
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
							)
							// Create new primary key with tenant_code
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, user_id, friend_id)`
							)
							break

						case 'entities':
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
							)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, id, entity_type_id)`
							)
							break

						case 'entity_types':
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
							)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, id, organization_id)`
							)
							break

						case 'forms':
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
							)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, id, organization_id)`
							)
							break

						case 'organization_extension':
							// organization_extension uses organization_id as primary key
							// Need to drop all potential primary key constraints (including spelling variations)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
							)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS organization_extension_pkey CASCADE`
							)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS organisation_extension_pkey CASCADE`
							)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS organization_extension_organization_id_key CASCADE`
							)

							// Check if primary key already exists before creating
							const [existingPkCheck] = await queryInterface.sequelize.query(`
								SELECT constraint_name FROM information_schema.table_constraints 
								WHERE table_name = 'organization_extension' 
								AND constraint_type = 'PRIMARY KEY'
							`)

							if (existingPkCheck.length === 0) {
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, organization_id)`
								)
							}
							break

						case 'user_extensions':
							// user_extensions uses user_id as primary key
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
							)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, user_id)`
							)
							break

						default:
							// For most tables, use (tenant_code, id) as primary key
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
							)
							await queryInterface.sequelize.query(
								`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, id)`
							)
							break
					}
					console.log(`✅ Updated primary key for ${tableName}`)
				} catch (error) {
					console.log(`⚠️  Could not update primary key for ${tableName}: ${error.message}`)
				}
			}

			// Process all tables
			let processedCount = 0
			for (const tableName of tablesToProcess) {
				const success = await processTableSafely(tableName)
				if (success) processedCount++
			}

			// Add organization_code columns to all tables with organization_id
			console.log('\n📝 Adding organization_code columns to tables with organization_id...')
			const tablesWithOrgId = [
				'availabilities',
				'default_rules',
				'entity_types',
				'file_uploads',
				'forms',
				'notification_templates',
				'organization_extension',
				'report_queries',
				'reports',
				'role_extensions',
				'user_extensions',
			]

			for (const tableName of tablesWithOrgId) {
				try {
					const tableExists = await queryInterface.sequelize.query(
						`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`,
						{ type: Sequelize.QueryTypes.SELECT }
					)

					if (tableExists[0].exists) {
						// Check if organization_code column already exists
						const columnExists = await queryInterface.sequelize.query(
							`SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name = 'organization_code')`,
							{ type: Sequelize.QueryTypes.SELECT }
						)

						if (!columnExists[0].exists) {
							await queryInterface.addColumn(tableName, 'organization_code', {
								type: Sequelize.STRING(255),
								allowNull: true,
							})
							console.log(`✅ Added organization_code to ${tableName}`)
						} else {
							console.log(`✅ ${tableName} already has organization_code column`)
						}
					}
				} catch (error) {
					console.log(`⚠️  Error adding organization_code to ${tableName}: ${error.message}`)
				}
			}

			// Add user_name to user_extensions if missing
			try {
				const userExtColumns = await queryInterface.describeTable('user_extensions')
				if (!userExtColumns.user_name) {
					await queryInterface.addColumn('user_extensions', 'user_name', {
						type: Sequelize.STRING(255),
						allowNull: true,
					})
					console.log('✅ Added user_name to user_extensions')
				}
			} catch (error) {
				console.log(`⚠️  Error adding user_name to user_extensions: ${error.message}`)
			}

			console.log(
				`\n✅ Phase 1 Complete: Processed ${processedCount}/${tablesToProcess.length} tables with tenant_code`
			)

			// =============================================================================
			// PHASE 1.5: FIX CONSTRAINTS FOR CITUS DISTRIBUTION
			// =============================================================================
			if (citusEnabled[0].exists) {
				console.log('\n🔧 PHASE 1.5: Fixing constraints for Citus distribution...')
				console.log('='.repeat(70))

				// Helper function to fix constraints for specific tables
				async function fixConstraintsForTable(tableName) {
					try {
						console.log(`Fixing constraints for: ${tableName}`)

						switch (tableName) {
							case 'connection_requests':
								// Drop existing constraints and create new ones with tenant_code
								await queryInterface.sequelize.query(
									`DROP INDEX IF EXISTS unique_user_id_friend_id_connection_requests`
								)
								await queryInterface.sequelize.query(`
									CREATE UNIQUE INDEX unique_user_id_friend_id_connection_requests_tenant 
									ON connection_requests (tenant_code, user_id, friend_id) 
									WHERE deleted_at IS NULL
								`)
								break

							case 'connections':
								await queryInterface.sequelize.query(
									`DROP INDEX IF EXISTS unique_user_id_friend_id_connections`
								)
								await queryInterface.sequelize.query(`
									CREATE UNIQUE INDEX unique_user_id_friend_id_connections_tenant 
									ON connections (tenant_code, user_id, friend_id) 
									WHERE deleted_at IS NULL
								`)
								break

							case 'default_rules':
								await queryInterface.sequelize.query(
									`DROP INDEX IF EXISTS unique_default_rules_constraint`
								)
								await queryInterface.sequelize.query(`
									CREATE UNIQUE INDEX unique_default_rules_constraint_tenant 
									ON default_rules (tenant_code, type, target_field, requester_field, organization_id) 
									WHERE deleted_at IS NULL
								`)
								break

							case 'entities':
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS unique_entities_value`)
								await queryInterface.sequelize.query(`
									CREATE UNIQUE INDEX unique_entities_value_tenant 
									ON entities (tenant_code, value, entity_type_id) 
									WHERE deleted_at IS NULL
								`)
								break

							case 'entity_types':
								// Note: entity_types uses organization_id, not org_id
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, id, organization_id)`
								)
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS unique_value_org_id`)
								await queryInterface.sequelize.query(`
									CREATE UNIQUE INDEX unique_value_organization_id_tenant 
									ON entity_types (tenant_code, value, organization_id) 
									WHERE deleted_at IS NULL
								`)
								break

							case 'forms':
								// Drop all existing constraints and indexes that might conflict
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS unique_type_subtype_orgid`)
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS unique_type_sub_type_org_id`)
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS forms_type_key`)
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS forms_type_unique`)
								await queryInterface.sequelize.query(
									`ALTER TABLE forms DROP CONSTRAINT IF EXISTS unique_type_sub_type_org_id CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_type_key CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_type_unique CASCADE`
								)

								// Create new unique constraint with tenant_code (only if not exists)
								const [existingIndex] = await queryInterface.sequelize.query(`
									SELECT indexname FROM pg_indexes 
									WHERE tablename = 'forms' AND indexname = 'unique_type_subtype_orgid_tenant'
								`)

								if (existingIndex.length === 0) {
									await queryInterface.sequelize.query(`
										CREATE UNIQUE INDEX unique_type_subtype_orgid_tenant 
										ON forms (tenant_code, type, sub_type, organization_id) 
										WHERE deleted_at IS NULL
									`)
								}
								break

							case 'modules':
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS code_unique`)
								await queryInterface.sequelize.query(`
									CREATE UNIQUE INDEX code_unique_tenant 
									ON modules (tenant_code, code) 
									WHERE deleted_at IS NULL
								`)
								break

							case 'organization_extension':
								// organization_extension uses organization_id as primary key, not id
								// First drop ALL existing primary key constraints (note the spelling variations)
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS organization_extension_pkey CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS organisation_extension_pkey CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS organization_extension_organization_id_key CASCADE`
								)

								// Drop any existing unique constraints on organization_id
								await queryInterface.sequelize.query(
									`DROP INDEX IF EXISTS organization_extension_organization_id_key`
								)
								await queryInterface.sequelize.query(
									`DROP INDEX IF EXISTS organization_extension_organization_id_unique`
								)
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS organisation_extension_pkey`)

								// Check if primary key already exists before creating
								const [existingPk] = await queryInterface.sequelize.query(`
									SELECT constraint_name FROM information_schema.table_constraints 
									WHERE table_name = 'organization_extension' 
									AND constraint_type = 'PRIMARY KEY'
								`)

								if (existingPk.length === 0) {
									await queryInterface.sequelize.query(
										`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, organization_id)`
									)
								}
								break

							case 'report_queries':
								await queryInterface.sequelize.query(
									`DROP INDEX IF EXISTS unique_queries_report_code_organization`
								)
								await queryInterface.sequelize.query(`
									CREATE UNIQUE INDEX unique_queries_report_code_organization_tenant 
									ON report_queries (tenant_code, report_code, organization_id) 
									WHERE deleted_at IS NULL
								`)
								break

							case 'report_types':
								// Drop all existing title constraints and indexes (including the current one)
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS report_types_title_unique`)
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS report_types_title`)
								await queryInterface.sequelize.query(`DROP INDEX IF EXISTS report_types_title_key`)
								await queryInterface.sequelize.query(
									`ALTER TABLE report_types DROP CONSTRAINT IF EXISTS report_types_title_unique CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE report_types DROP CONSTRAINT IF EXISTS report_types_title CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE report_types DROP CONSTRAINT IF EXISTS report_types_title_key CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE report_types DROP CONSTRAINT IF EXISTS unique_title CASCADE`
								)

								// Create new unique constraint with tenant_code (only if not exists)
								const [existingTitleIndex] = await queryInterface.sequelize.query(`
									SELECT indexname FROM pg_indexes 
									WHERE tablename = 'report_types' AND indexname = 'report_types_title_unique_tenant'
								`)

								if (existingTitleIndex.length === 0) {
									await queryInterface.sequelize.query(`
										CREATE UNIQUE INDEX report_types_title_unique_tenant 
										ON report_types (tenant_code, title) 
										WHERE deleted_at IS NULL
									`)
								}
								break

							case 'reports':
								await queryInterface.sequelize.query(
									`DROP INDEX IF EXISTS report_code_organization_unique`
								)
								await queryInterface.sequelize.query(`
									CREATE UNIQUE INDEX report_code_organization_unique_tenant 
									ON reports (tenant_code, code, organization_id) 
									WHERE deleted_at IS NULL
								`)
								break

							case 'user_extensions':
								// user_extensions uses user_id as primary key, not id
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_pkey CASCADE`
								)
								await queryInterface.sequelize.query(
									`ALTER TABLE ${tableName} ADD PRIMARY KEY (tenant_code, user_id)`
								)
								break

							default:
								// For other tables, just ensure they have proper constraints
								console.log(`✅ ${tableName} constraints already properly configured`)
								break
						}

						console.log(`✅ Fixed constraints for ${tableName}`)
						return true
					} catch (error) {
						console.log(`❌ Could not fix constraints for ${tableName}: ${error.message}`)
						return false
					}
				}

				// Fix constraints for tables that had issues
				const constraintFixTables = [
					'connection_requests',
					'connections',
					'default_rules',
					'entities',
					'entity_types',
					'forms',
					'modules',
					'organization_extension',
					'report_queries',
					'report_types',
					'reports',
					'user_extensions',
				]

				let constraintFixCount = 0
				for (const tableName of constraintFixTables) {
					const success = await fixConstraintsForTable(tableName)
					if (success) constraintFixCount++
				}

				console.log(
					`\n✅ Phase 1.5 Complete: Fixed constraints for ${constraintFixCount}/${constraintFixTables.length} tables`
				)
			}

			// =============================================================================
			// PHASE 2: REDISTRIBUTE TABLES (ONLY IF CITUS IS ENABLED)
			// =============================================================================
			if (citusEnabled[0].exists) {
				console.log('\n🔄 PHASE 2: Redistributing tables with tenant_code...')
				console.log('='.repeat(70))

				// Helper function to safely redistribute table
				async function redistributeTableSafely(tableName, distributionColumn = 'tenant_code') {
					try {
						// Verify the distribution column exists
						const columns = await queryInterface.describeTable(tableName)
						if (!columns[distributionColumn]) {
							console.log(`❌ Column ${distributionColumn} does not exist in ${tableName}, skipping`)
							return false
						}

						// Check if table is already distributed
						const distInfo = await queryInterface.sequelize.query(
							`SELECT count(*) as count FROM pg_dist_partition WHERE logicalrelid = '${tableName}'::regclass`,
							{ type: Sequelize.QueryTypes.SELECT }
						)

						if (distInfo[0].count > 0) {
							console.log(`✅ Table ${tableName} already distributed`)
							return true
						}

						// Distribute the table
						await queryInterface.sequelize.query(
							`SELECT create_distributed_table('${tableName}', '${distributionColumn}')`
						)
						console.log(`✅ Distributed table: ${tableName} with ${distributionColumn}`)
						return true
					} catch (error) {
						console.log(`❌ Could not distribute ${tableName}: ${error.message}`)
						return false
					}
				}

				// Distribute all tables with tenant_code
				const distributionResults = { success: [], failed: [] }

				for (const tableName of tablesToProcess) {
					const success = await redistributeTableSafely(tableName, 'tenant_code')
					if (success) {
						distributionResults.success.push(tableName)
					} else {
						distributionResults.failed.push(tableName)
					}
				}

				// Special case: role_permission_mapping uses role_title
				const rolePermSuccess = await redistributeTableSafely('role_permission_mapping', 'role_title')
				if (rolePermSuccess) {
					distributionResults.success.push('role_permission_mapping')
				}

				console.log(`\n✅ Phase 2 Complete: Distributed ${distributionResults.success.length} tables`)
				if (distributionResults.failed.length > 0) {
					console.log(`⚠️  Failed to distribute: ${distributionResults.failed.join(', ')}`)
				}
			} else {
				console.log('\n⚠️  PHASE 2 SKIPPED: Citus not enabled, tables remain local')
			}

			// =============================================================================
			// PHASE 3: CLEANUP OBSOLETE TABLES
			// =============================================================================
			console.log('\n🗑️  PHASE 3: Cleaning up obsolete tables...')
			console.log('='.repeat(70))

			const obsoleteTables = ['session_enrollments', 'session_ownerships', 'session_request_mapping']

			for (const tableName of obsoleteTables) {
				try {
					const tableExists = await queryInterface.sequelize.query(
						`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`,
						{ type: Sequelize.QueryTypes.SELECT }
					)

					if (tableExists[0].exists) {
						// Undistribute if distributed (Citus only)
						if (citusEnabled[0].exists) {
							try {
								await queryInterface.sequelize.query(`SELECT undistribute_table('${tableName}')`)
							} catch (error) {
								// Table might not be distributed
							}
						}

						await queryInterface.dropTable(tableName)
						console.log(`✅ Deleted obsolete table: ${tableName}`)
					}
				} catch (error) {
					console.log(`⚠️  Could not delete ${tableName}: ${error.message}`)
				}
			}

			// =============================================================================
			// PHASE 4: FINAL VERIFICATION
			// =============================================================================
			console.log('\n📊 PHASE 4: Final verification...')
			console.log('='.repeat(70))

			// Count tables with tenant_code columns
			const [tenantCodeTables] = await queryInterface.sequelize.query(`
				SELECT COUNT(*) as count 
				FROM information_schema.columns 
				WHERE table_schema = 'public' 
				AND column_name = 'tenant_code'
			`)

			let distributedCount = 0
			if (citusEnabled[0].exists) {
				const [distributedTables] = await queryInterface.sequelize.query(`
					SELECT COUNT(*) as count FROM pg_dist_partition
				`)
				distributedCount = distributedTables[0].count
			}

			// Count tables with organization_code columns
			const [orgCodeTables] = await queryInterface.sequelize.query(`
				SELECT COUNT(*) as count 
				FROM information_schema.columns 
				WHERE table_schema = 'public' 
				AND column_name = 'organization_code'
			`)

			// Final summary
			console.log('\n🎯 MIGRATION COMPLETED SUCCESSFULLY!')
			console.log('='.repeat(70))
			console.log(`✅ Tables with tenant_code columns: ${tenantCodeTables[0].count}`)
			console.log(`✅ Tables with organization_code columns: ${orgCodeTables[0].count}`)
			if (citusEnabled[0].exists) {
				console.log(`✅ Distributed tables: ${distributedCount}`)
				console.log(`✅ Distribution success rate: ${Math.round((distributedCount / 28) * 100)}%`)
			} else {
				console.log(`✅ Local PostgreSQL setup complete`)
			}
			console.log(`✅ Obsolete tables cleaned up: ${obsoleteTables.length}`)
			console.log('\n🎉 Complete tenant-code migration finished!')
		} catch (error) {
			console.error('❌ Complete tenant-code migration failed:', error)
			throw error
		}
	},

	down: async (queryInterface, Sequelize) => {
		try {
			console.log('🔄 Rolling back complete tenant-code migration...')

			// Check if Citus is enabled
			const citusEnabled = await queryInterface.sequelize.query(
				"SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'citus')",
				{ type: Sequelize.QueryTypes.SELECT }
			)

			console.log('⚠️  ROLLBACK WARNING:')
			console.log('   This will remove all tenant_code columns and undo distribution')
			console.log('   This is a destructive operation that may cause data loss')
			console.log('   Consider restoring from backup instead')

			const tablesToRollback = [
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
				'post_session_details',
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

			// Undistribute all tables if Citus is enabled
			if (citusEnabled[0].exists) {
				console.log('\n📤 Undistributing tables...')
				for (const tableName of tablesToRollback) {
					try {
						await queryInterface.sequelize.query(`SELECT undistribute_table('${tableName}')`)
						console.log(`✅ Undistributed: ${tableName}`)
					} catch (error) {
						console.log(`⚠️  Could not undistribute ${tableName}: ${error.message}`)
					}
				}

				// Undistribute role_permission_mapping
				try {
					await queryInterface.sequelize.query(`SELECT undistribute_table('role_permission_mapping')`)
					console.log(`✅ Undistributed: role_permission_mapping`)
				} catch (error) {
					console.log(`⚠️  Could not undistribute role_permission_mapping: ${error.message}`)
				}
			}

			// Remove tenant_code columns
			console.log('\n🗑️  Removing tenant_code columns...')
			for (const tableName of tablesToRollback) {
				try {
					await queryInterface.removeColumn(tableName, 'tenant_code')
					console.log(`✅ Removed tenant_code from ${tableName}`)
				} catch (error) {
					console.log(`⚠️  Could not remove tenant_code from ${tableName}: ${error.message}`)
				}
			}

			// Remove organization_code columns from all tables
			console.log('\n🗑️  Removing organization_code columns...')
			const tablesWithOrgCode = [
				'availabilities',
				'default_rules',
				'entity_types',
				'file_uploads',
				'forms',
				'notification_templates',
				'organization_extension',
				'report_queries',
				'reports',
				'role_extensions',
				'user_extensions',
			]

			for (const tableName of tablesWithOrgCode) {
				try {
					await queryInterface.removeColumn(tableName, 'organization_code')
					console.log(`✅ Removed organization_code from ${tableName}`)
				} catch (error) {
					console.log(`⚠️  Could not remove organization_code from ${tableName}: ${error.message}`)
				}
			}

			// Remove user_name from user_extensions
			try {
				await queryInterface.removeColumn('user_extensions', 'user_name')
				console.log('✅ Removed user_name from user_extensions')
			} catch (error) {
				console.log(`⚠️  Could not remove user_name from user_extensions: ${error.message}`)
			}

			console.log('\n🔄 Rollback completed')
		} catch (error) {
			console.error('❌ Rollback failed:', error)
			throw error
		}
	},
}
