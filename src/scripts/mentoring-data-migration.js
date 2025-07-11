const { Sequelize } = require('sequelize')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
require('dotenv').config({ path: '../.env' })

/**
 * Citus-Compatible Data Migration Script for Mentoring Service - REFRESHED VERSION
 * Handles partition value updates by temporarily undistributing tables
 * Updates tenant_code and organization_code based on user service data
 * Always processes all data on every run (no idempotent behavior)
 */

class MentoringDataMigrator {
	constructor() {
		this.sequelize = new Sequelize(process.env.DEV_DATABASE_URL, {
			dialect: 'postgres',
			logging: false,
			pool: {
				max: 10,
				min: 2,
				acquire: 30000,
				idle: 10000,
			},
		})

		// Default values from environment
		this.defaultTenantCode = process.env.DEFAULT_ORGANISATION_CODE || 'DEFAULT_TENANT'
		this.defaultOrgCode = process.env.DEFAULT_ORG_CODE || 'DEFAULT_ORG'
		this.defaultOrgId = process.env.DEFAULT_ORG_ID || '1'

		// Batch processing configuration
		this.batchSize = 5000
		this.maxRetries = 3
		this.retryDelay = 2000
		this.progressInterval = 5000

		// Data caches for efficient lookups
		this.orgLookupCache = new Map()
		this.userLookupCache = new Map()
		this.userOrgCache = new Map()

		// Processing statistics
		this.stats = {
			totalProcessed: 0,
			successfulUpdates: 0,
			failedUpdates: 0,
			skippedRecords: 0,
			tablesUndistributed: 0,
			tablesRedistributed: 0,
			startTime: Date.now(),
		}

		// Tables with organization_id - process first using GROUP BY organization_id
		this.tablesWithOrgId = [
			{
				name: 'availabilities',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'default_rules',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'entity_types',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'file_uploads',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'forms',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'notification_templates',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'organization_extension',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
				primaryKey: ['tenant_code', 'organization_id'],
			},
			{
				name: 'report_queries',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'reports',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'role_extensions',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'report_role_mapping',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'report_types',
				columns: { organization_id: 'organization_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
		]

		// Tables with only user_id - process second using user_extensions updated data
		this.tablesWithUserId = [
			{
				name: 'user_extensions',
				columns: { user_id: 'user_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
				primaryKey: ['tenant_code', 'user_id'],
			},
			{
				name: 'sessions',
				columns: { user_id: 'created_by' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'session_attendees',
				columns: { user_id: 'mentee_id' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'feedbacks',
				columns: { user_id: 'user_id' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'connection_requests',
				columns: { user_id: 'created_by' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'connections',
				columns: { user_id: 'created_by' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'entities',
				columns: { user_id: 'created_by' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'issues',
				columns: { user_id: 'user_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'resources',
				columns: { user_id: 'created_by' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'session_request',
				columns: { user_id: 'created_by' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'question_sets',
				columns: { user_id: 'created_by' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'questions',
				columns: { user_id: 'created_by' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
			},
			{
				name: 'post_session_details',
				columns: { session_id: 'session_id' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
				useSessionLookup: true,
			},
			{
				name: 'modules',
				columns: {},
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
				useDefaultValues: true,
			},
		]
	}

	/**
	 * Load lookup data from data_codes.csv file
	 */
	async loadLookupData() {
		console.log('🔄 Loading lookup data from data_codes.csv...')

		try {
			await this.loadTenantAndOrgCsv()

			console.log(`✅ Loaded lookup data:`)
			console.log(`   - Organization codes: ${this.orgLookupCache.size}`)
		} catch (error) {
			console.error('❌ Failed to load lookup data:', error)
			throw error
		}
	}

	async loadTenantAndOrgCsv() {
		const csvPath = path.join(__dirname, '../data/data_codes.csv')
		if (!fs.existsSync(csvPath)) {
			console.log('⚠️  data_codes.csv not found, using defaults')
			return
		}

		const requiredHeaders = ['tenant_code', 'organization_code', 'organization_id']
		let isHeaderValidated = false

		return new Promise((resolve, reject) => {
			fs.createReadStream(csvPath)
				.pipe(csv())
				.on('headers', (headers) => {
					console.log('📋 CSV Headers found:', headers)

					// Validate required headers
					const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))
					if (missingHeaders.length > 0) {
						reject(
							new Error(
								`❌ Missing required CSV headers: ${missingHeaders.join(
									', '
								)}. Required headers: ${requiredHeaders.join(', ')}`
							)
						)
						return
					}

					console.log('✅ CSV headers validation passed')
					isHeaderValidated = true
				})
				.on('data', (row) => {
					if (!isHeaderValidated) {
						return // Skip processing until headers are validated
					}

					if (row.organization_id && row.organization_code && row.tenant_code) {
						this.orgLookupCache.set(row.organization_id, {
							organization_code: row.organization_code,
							tenant_code: row.tenant_code,
						})
					} else {
						console.warn('⚠️  Skipping invalid row:', row)
					}
				})
				.on('end', () => {
					if (!isHeaderValidated) {
						reject(new Error('❌ CSV headers could not be validated'))
						return
					}
					console.log(`✅ Loaded ${this.orgLookupCache.size} organization codes`)
					resolve()
				})
				.on('error', reject)
		})
	}

	/**
	 * Check if Citus is enabled
	 */
	async isCitusEnabled() {
		try {
			const [result] = await this.sequelize.query(`
				SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'citus') as enabled
			`)
			return result[0].enabled
		} catch (error) {
			return false
		}
	}

	/**
	 * Check if table is distributed
	 */
	async isTableDistributed(tableName) {
		try {
			const [result] = await this.sequelize.query(`
				SELECT COUNT(*) as count 
				FROM pg_dist_partition 
				WHERE logicalrelid = '${tableName}'::regclass
			`)
			return parseInt(result[0].count) > 0
		} catch (error) {
			return false
		}
	}

	/**
	 * Undistribute a table temporarily for updates
	 */
	async undistributeTable(tableName) {
		try {
			const isDistributed = await this.isTableDistributed(tableName)
			if (isDistributed) {
				await this.sequelize.query(`SELECT undistribute_table('${tableName}')`)
				console.log(`✅ Undistributed table: ${tableName}`)
				this.stats.tablesUndistributed++
				return true
			}
			return false
		} catch (error) {
			console.log(`⚠️  Could not undistribute ${tableName}: ${error.message}`)
			return false
		}
	}

	/**
	 * Redistribute table after updates
	 */
	async redistributeTable(tableName) {
		try {
			await this.sequelize.query(`SELECT create_distributed_table('${tableName}', 'tenant_code')`)
			console.log(`✅ Redistributed table: ${tableName}`)
			this.stats.tablesRedistributed++
			return true
		} catch (error) {
			console.log(`⚠️  Could not redistribute ${tableName}: ${error.message}`)
			return false
		}
	}

	/**
	 * Process tables with organization_id using GROUP BY strategy
	 */
	async processTablesWithOrgId() {
		console.log('\n🔄 PHASE 1: Processing tables with organization_id using GROUP BY strategy...')
		console.log('='.repeat(70))

		for (const tableConfig of this.tablesWithOrgId) {
			await this.processTableWithOrgId(tableConfig)
		}
	}

	/**
	 * Process a single table with organization_id using efficient GROUP BY updates
	 */
	async processTableWithOrgId(tableConfig) {
		const { name, updateColumns, hasPartitionKey } = tableConfig
		console.log(`\n🔄 Processing table with organization_id: ${name}`)

		try {
			// Check if table exists and has target columns
			const existingColumns = await this.checkTableColumns(name)
			const availableUpdateColumns = updateColumns.filter((col) => existingColumns.includes(col))

			if (availableUpdateColumns.length === 0) {
				console.log(`⚠️  Table ${name} has no target columns, skipping`)
				return
			}

			console.log(`📋 Available columns for update: ${availableUpdateColumns.join(', ')}`)

			// Check if we need to update tenant_code (partition key)
			const needsTenantCodeUpdate = availableUpdateColumns.includes('tenant_code')
			const citusEnabled = await this.isCitusEnabled()

			// Step 1: Undistribute table if we need to update partition key
			let wasDistributed = false
			if (citusEnabled && hasPartitionKey && needsTenantCodeUpdate) {
				wasDistributed = await this.undistributeTable(name)
				console.log(`🔄 Undistributed ${name} to update partition key`)
			}

			try {
				// Step 2: Use efficient GROUP BY update strategy
				const updateResult = await this.executeGroupByUpdates(name, availableUpdateColumns)

				// Add detailed logging like in migration
				await this.logTableUpdateResults(name)

				// Step 3: Redistribute table if it was distributed before
				if (citusEnabled && wasDistributed && needsTenantCodeUpdate) {
					console.log(`🔄 Redistributing ${name} with updated tenant_code...`)
					await this.redistributeTable(name)
				}
			} catch (error) {
				console.error(`❌ Error updating table ${name}:`, error)

				// Try to redistribute table even if updates failed
				if (citusEnabled && wasDistributed && needsTenantCodeUpdate) {
					console.log(`🔄 Attempting to redistribute ${name} after error...`)
					await this.redistributeTable(name)
				}
				throw error
			}

			console.log(`✅ Completed ${name}`)
		} catch (error) {
			console.error(`❌ Error processing table ${name}:`, error)
			throw error
		}
	}

	/**
	 * Execute efficient GROUP BY updates for tables with organization_id
	 */
	async executeGroupByUpdates(tableName, availableUpdateColumns) {
		console.log(`📊 Executing GROUP BY updates for ${tableName}...`)

		// Check if table has organization_id column
		const [columnCheck] = await this.sequelize.query(`
			SELECT EXISTS(
				SELECT 1 FROM information_schema.columns 
				WHERE table_name = '${tableName}' 
				AND column_name = 'organization_id'
			) as has_org_id
		`)

		if (!columnCheck[0].has_org_id) {
			console.log(`⚠️  Table ${tableName} does not have organization_id column, skipping GROUP BY update`)
			return
		}

		const transaction = await this.sequelize.transaction()

		try {
			// Build the SET clause dynamically
			const setClauses = []

			if (availableUpdateColumns.includes('tenant_code')) {
				setClauses.push(`tenant_code = dc.tenant_code`)
			}

			if (availableUpdateColumns.includes('organization_code')) {
				setClauses.push(`organization_code = dc.organization_code`)
			}

			if (setClauses.length === 0) {
				console.log(`⚠️  No valid columns to update in ${tableName}`)
				await transaction.commit()
				return
			}

			// Drop temp table if it exists
			await this.sequelize.query(`DROP TABLE IF EXISTS temp_data_codes`, { transaction })

			// Create temporary table with data codes for join
			await this.sequelize.query(
				`
				CREATE TEMP TABLE temp_data_codes AS
				SELECT DISTINCT 
					organization_id::text,
					organization_code,
					tenant_code
				FROM (VALUES ${Array.from(this.orgLookupCache.entries())
					.map(([orgId, data]) => `('${orgId}', '${data.organization_code}', '${data.tenant_code}')`)
					.join(', ')}) AS t(organization_id, organization_code, tenant_code)
			`,
				{ transaction }
			)

			// Always process all data - no idempotent checks (as requested)
			console.log(`🔄 Processing all records in ${tableName} (no skipping)`)

			// Execute UPDATE using batch-wise organization processing (GROUP BY approach)
			// Get distinct organizations from temp table for batch processing
			const [orgList] = await this.sequelize.query(
				`
				SELECT DISTINCT organization_id FROM temp_data_codes ORDER BY organization_id
			`,
				{ transaction }
			)

			console.log(`🔄 Processing ${tableName} with ${orgList.length} organizations using batch approach`)
			let totalUpdated = 0

			// Process organizations in batches of 5000
			const orgBatchSize = 5000
			for (let i = 0; i < orgList.length; i += orgBatchSize) {
				const orgBatch = orgList.slice(i, i + orgBatchSize)

				// Process each organization individually for clean batch processing
				for (const org of orgBatch) {
					const [, metadata] = await this.sequelize.query(
						`
						UPDATE ${tableName} 
						SET ${setClauses.join(', ')}, updated_at = NOW()
						FROM temp_data_codes dc
						WHERE ${tableName}.organization_id::text = dc.organization_id
						AND ${tableName}.organization_id::text = '${org.organization_id.replace(/'/g, "''")}'
					`,
						{ transaction }
					)

					totalUpdated += metadata.rowCount || 0
				}
			}

			console.log(
				`✅ Updated ${totalUpdated} rows in ${tableName} using organization-based batching (${Math.ceil(
					orgList.length / orgBatchSize
				)} batches)`
			)
			this.stats.successfulUpdates += totalUpdated

			// Clean up temp table
			await this.sequelize.query(`DROP TABLE IF EXISTS temp_data_codes`, { transaction })

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	/**
	 * Process tables with user_id using user_extensions updated data
	 */
	async processTablesWithUserId() {
		console.log('\n🔄 PHASE 2: Processing tables with user_id using user_extensions data...')
		console.log('='.repeat(70))

		// First process user_extensions to get updated data
		const userExtConfig = this.tablesWithUserId.find((t) => t.name === 'user_extensions')
		if (userExtConfig) {
			await this.processUserExtensions(userExtConfig)
		}

		// Then process other tables with user_id
		for (const tableConfig of this.tablesWithUserId) {
			if (tableConfig.name !== 'user_extensions') {
				await this.processTableWithUserId(tableConfig)
			}
		}
	}

	/**
	 * Process user_extensions table using GROUP BY organization_id approach
	 */
	async processUserExtensions(tableConfig) {
		console.log(`\n🔄 Processing user_extensions with GROUP BY organization_id approach...`)

		// Use organization-based batch processing for user_extensions
		// Get distinct organizations from orgLookupCache (from CSV data)
		const orgIds = Array.from(this.orgLookupCache.keys())
		console.log(`🔄 Processing user_extensions with ${orgIds.length} organizations from CSV data`)

		if (orgIds.length === 0) {
			console.log(`⚠️  No organizations found in lookup cache, skipping user_extensions updates`)
			return
		}

		const transaction = await this.sequelize.transaction()
		let totalUpdated = 0

		try {
			// Create temp table with organization lookup data
			await this.sequelize.query(
				`
					CREATE TEMP TABLE temp_user_org_lookup AS
					SELECT DISTINCT 
						organization_id::text,
						organization_code,
						tenant_code
					FROM (VALUES ${Array.from(this.orgLookupCache.entries())
						.map(([orgId, data]) => `('${orgId}', '${data.organization_code}', '${data.tenant_code}')`)
						.join(', ')}) AS t(organization_id, organization_code, tenant_code)
				`,
				{ transaction }
			)

			// Process organizations in batches of 5000
			const orgBatchSize = 5000
			for (let i = 0; i < orgIds.length; i += orgBatchSize) {
				const orgBatch = orgIds.slice(i, i + orgBatchSize)

				// Process each organization individually for clean batch processing
				for (const orgId of orgBatch) {
					const orgData = this.orgLookupCache.get(orgId)
					if (!orgData) continue

					const [, metadata] = await this.sequelize.query(
						`
						UPDATE user_extensions 
						SET 
							tenant_code = '${orgData.tenant_code}',
							organization_code = '${orgData.organization_code}',
							updated_at = NOW()
						WHERE organization_id::text = '${orgId.replace(/'/g, "''")}'
						AND (tenant_code IS NULL OR tenant_code = '' OR organization_code IS NULL OR organization_code = '')
					`,
						{ transaction }
					)

					totalUpdated += metadata.rowCount || 0
				}
			}

			// Clean up temp table
			await this.sequelize.query(`DROP TABLE IF EXISTS temp_user_org_lookup`, { transaction })

			console.log(
				`✅ Updated ${totalUpdated} user_extensions records using GROUP BY organization_id approach (${Math.ceil(
					orgIds.length / orgBatchSize
				)} org batches)`
			)
			this.stats.successfulUpdates += totalUpdated

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	/**
	 * Process table with user_id using user_extensions updated data
	 */
	async processTableWithUserId(tableConfig) {
		const { name, updateColumns, hasPartitionKey } = tableConfig
		console.log(`\n🔄 Processing table with user_id: ${name}`)

		try {
			// Check if table exists and has target columns
			const existingColumns = await this.checkTableColumns(name)
			const availableUpdateColumns = updateColumns.filter((col) => existingColumns.includes(col))

			if (availableUpdateColumns.length === 0) {
				console.log(`⚠️  Table ${name} has no target columns, skipping`)
				return
			}

			// Only update tenant_code for user_id tables
			if (availableUpdateColumns.includes('tenant_code')) {
				const citusEnabled = await this.isCitusEnabled()

				// Undistribute if needed
				let wasDistributed = false
				if (citusEnabled && hasPartitionKey) {
					wasDistributed = await this.undistributeTable(name)
				}

				try {
					await this.executeUserIdUpdates(name)

					// Add detailed logging like in migration
					await this.logTableUpdateResults(name)

					// Redistribute if needed
					if (citusEnabled && wasDistributed) {
						await this.redistributeTable(name)
					}
				} catch (error) {
					console.error(`❌ Error during updates for ${name}:`, error.message)
					throw error
				}
			}

			console.log(`✅ Completed ${name}`)
		} catch (error) {
			console.error(`❌ Error processing table ${name}:`, error)
			throw error
		}
	}

	/**
	 * Execute updates for tables with user_id using user_extensions data
	 */
	async executeUserIdUpdates(tableName) {
		console.log(`📊 Executing user_id updates for ${tableName}...`)

		const transaction = await this.sequelize.transaction()

		try {
			// Get table configuration
			const tableConfig = this.tablesWithUserId.find((t) => t.name === tableName)

			let updateQuery

			if (tableConfig.useSessionLookup) {
				// Special case for post_session_details: get data from sessions table based on session_id
				const sessionIdColumn = tableConfig.columns.session_id

				// Build SET clause based on available update columns
				const setClauses = []
				if (tableConfig.updateColumns.includes('tenant_code')) {
					setClauses.push('tenant_code = s.tenant_code')
				}
				if (tableConfig.updateColumns.includes('organization_code')) {
					setClauses.push('organization_code = s.organization_code')
				}
				setClauses.push('updated_at = NOW()')

				// Build WHERE conditions based on what columns sessions table actually has
				// Check for non-default values since migration sets defaults
				const defaultTenantCode = process.env.DEFAULT_ORGANISATION_CODE || 'default'
				const whereConditions = [
					`${tableName}.${sessionIdColumn} = s.id`,
					`s.tenant_code IS NOT NULL AND s.tenant_code != '${defaultTenantCode}'`,
				]

				// Only add organization_code condition if we're actually using it
				if (tableConfig.updateColumns.includes('organization_code')) {
					whereConditions.push('s.organization_code IS NOT NULL')
				}

				// Use batch processing for session lookup - get distinct session organizations
				const [sessionOrgs] = await this.sequelize.query(`
				SELECT DISTINCT s.organization_id::text as org_id
				FROM sessions s
				INNER JOIN ${tableName} t ON t.${sessionIdColumn} = s.id
				WHERE s.tenant_code IS NOT NULL 
				AND s.tenant_code != '${defaultTenantCode}'
				AND s.organization_id IS NOT NULL
				ORDER BY org_id
			`)

				console.log(
					`🔄 Processing ${tableName} with ${sessionOrgs.length} session organizations (batch approach)`
				)
				let totalUpdated = 0

				// Process organizations in batches of 5000
				const orgBatchSize = 5000
				for (let i = 0; i < sessionOrgs.length; i += orgBatchSize) {
					const orgBatch = sessionOrgs.slice(i, i + orgBatchSize)

					// Process each organization individually
					for (const org of orgBatch) {
						const [, metadata] = await this.sequelize.query(
							`
						UPDATE ${tableName} 
						SET ${setClauses.join(', ')}
						FROM sessions s
						WHERE ${whereConditions.join(' AND ')}
						AND s.organization_id::text = '${org.org_id.replace(/'/g, "''")}'
					`,
							{ transaction }
						)

						totalUpdated += metadata.rowCount || 0
					}
				}

				console.log(
					`✅ Updated ${totalUpdated} rows in ${tableName} using session organization batching (${Math.ceil(
						sessionOrgs.length / orgBatchSize
					)} batches)`
				)
				this.stats.successfulUpdates += totalUpdated
				await transaction.commit()
				return
			} else if (tableConfig.useDefaultValues) {
				// REMOVED: Migration already sets default values, skipping this logic
				console.log(`⚠️  Table ${tableName} uses default values - migration already handled this, skipping`)
				await transaction.commit()
				return
			} else {
				// Standard user_id lookup using user_extensions with GROUP BY organization_id approach
				const userIdColumn = tableConfig.columns.user_id
				const defaultTenantCode = process.env.DEFAULT_ORGANISATION_CODE || 'default'

				// Get distinct organizations from user_extensions for this table
				const [userExtByOrg] = await this.sequelize.query(`
					SELECT DISTINCT ue.organization_id::text as org_id
					FROM user_extensions ue
					INNER JOIN ${tableName} t ON t.${userIdColumn} = ue.user_id
					WHERE ue.organization_id IS NOT NULL
					AND ue.tenant_code IS NOT NULL
					AND ue.tenant_code != '${defaultTenantCode}'
					ORDER BY org_id
				`)

				console.log(`🔄 Processing ${tableName} with ${userExtByOrg.length} organizations (GROUP BY approach)`)

				if (userExtByOrg.length === 0) {
					console.log(`⚠️  No organizations found for ${tableName}, skipping updates`)
					await transaction.commit()
					return
				}

				let totalUpdated = 0

				// Process each organization in batches
				const orgBatchSize = 5000
				for (let i = 0; i < userExtByOrg.length; i += orgBatchSize) {
					const orgBatch = userExtByOrg.slice(i, i + orgBatchSize)

					// Process each organization individually
					for (const org of orgBatch) {
						// Build SET clause based on available update columns
						const setClauses = []
						if (tableConfig.updateColumns.includes('tenant_code')) {
							setClauses.push('tenant_code = ue.tenant_code')
						}
						if (tableConfig.updateColumns.includes('organization_code')) {
							setClauses.push('organization_code = ue.organization_code')
						}
						setClauses.push('updated_at = NOW()')

						const [, metadata] = await this.sequelize.query(
							`
							UPDATE ${tableName} 
							SET ${setClauses.join(', ')}
							FROM user_extensions ue
							WHERE ${tableName}.${userIdColumn} = ue.user_id
							AND ue.organization_id::text = '${org.org_id.replace(/'/g, "''")}'
							AND ue.tenant_code IS NOT NULL
							AND ue.tenant_code != '${defaultTenantCode}'
						`,
							{ transaction }
						)

						totalUpdated += metadata.rowCount || 0
					}
				}

				console.log(`✅ Updated ${totalUpdated} rows in ${tableName} using GROUP BY organization_id approach`)
				this.stats.successfulUpdates += totalUpdated
				await transaction.commit()
				return
			}

			// All paths above handle their own transaction commits and returns
			// This should not be reached
			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	/**
	 * Get lookup data for a record (legacy method for individual processing)
	 */
	getLookupData(record, tableConfig) {
		const { columns } = tableConfig
		let tenantCode = this.defaultTenantCode
		let organizationCode = this.defaultOrgCode

		// Try organization_id lookup first
		if (columns.organization_id && record[columns.organization_id]) {
			const orgId = record[columns.organization_id]
			const orgData = this.orgLookupCache.get(orgId)
			if (orgData) {
				tenantCode = orgData.tenant_code
				organizationCode = orgData.organization_code
				return { tenantCode, organizationCode, source: 'organization_id' }
			}
		}

		return { tenantCode, organizationCode, source: 'default' }
	}

	/**
	 * Process a single table with forced updates for tenant_code and organization_code
	 */
	async processTable(tableConfig) {
		const { name, updateColumns, hasPartitionKey } = tableConfig
		console.log(`\n🔄 Processing table: ${name}`)

		try {
			// Check if table exists and has target columns
			const existingColumns = await this.checkTableColumns(name)
			const availableUpdateColumns = updateColumns.filter((col) => existingColumns.includes(col))

			if (availableUpdateColumns.length === 0) {
				console.log(`⚠️  Table ${name} has no target columns, skipping`)
				return
			}

			console.log(`📋 Available columns for update: ${availableUpdateColumns.join(', ')}`)
			console.log(`⚠️  Will update ALL records regardless of existing values`)

			// Get total count
			const [countResult] = await this.sequelize.query(`SELECT COUNT(*) as total FROM ${name}`)
			const totalRecords = parseInt(countResult[0].total)

			if (totalRecords === 0) {
				console.log(`✅ Table ${name} is empty, skipping`)
				return
			}

			console.log(`📊 Total records in ${name}: ${totalRecords.toLocaleString()}`)

			// Check if we need to update tenant_code (partition key)
			const needsTenantCodeUpdate = availableUpdateColumns.includes('tenant_code')

			// Check if Citus is enabled before doing any distribution logic
			const citusEnabled = await this.isCitusEnabled()
			console.log(`🔧 Citus enabled: ${citusEnabled ? 'Yes' : 'No'}`)

			// Step 1: Undistribute table if we need to update partition key or if it's distributed (Citus only)
			let wasDistributed = false
			if (citusEnabled && hasPartitionKey && needsTenantCodeUpdate) {
				wasDistributed = await this.undistributeTable(name)
				console.log(`🔄 Undistributed ${name} to update partition key (tenant_code)`)
			} else if (citusEnabled && hasPartitionKey) {
				wasDistributed = await this.isTableDistributed(name)
			}

			try {
				// Step 2: Process all updates (including tenant_code when undistributed)
				await this.processTableUpdates(tableConfig, totalRecords, availableUpdateColumns)

				// Step 3: Redistribute table if it was distributed before (Citus only)
				if (citusEnabled && wasDistributed && needsTenantCodeUpdate) {
					console.log(`🔄 Redistributing ${name} with updated tenant_code...`)
					await this.redistributeTable(name)
				}
			} catch (error) {
				console.error(`❌ Error updating table ${name}:`, error)

				// Try to redistribute table even if updates failed (Citus only)
				if (citusEnabled && wasDistributed && needsTenantCodeUpdate) {
					console.log(`🔄 Attempting to redistribute ${name} after error...`)
					await this.redistributeTable(name)
				}
				throw error
			}

			console.log(`✅ Completed ${name}`)
		} catch (error) {
			console.error(`❌ Error processing table ${name}:`, error)
			throw error
		}
	}

	/**
	 * Process table updates in batches with forced updates
	 */
	async processTableUpdates(tableConfig, totalRecords, availableUpdateColumns) {
		const { name } = tableConfig
		let processedCount = 0
		let offset = 0
		let totalUpdates = 0

		// Use modified config with only available columns
		const modifiedConfig = {
			...tableConfig,
			updateColumns: availableUpdateColumns,
		}

		while (offset < totalRecords) {
			const batch = await this.processBatch(
				modifiedConfig,
				offset,
				Math.min(this.batchSize, totalRecords - offset)
			)
			processedCount += batch.processed
			totalUpdates += batch.updates
			offset += this.batchSize

			// Progress update
			if (processedCount % this.progressInterval === 0 || offset >= totalRecords) {
				const progress = Math.round((processedCount / totalRecords) * 100)
				console.log(
					`   📈 Progress: ${processedCount.toLocaleString()}/${totalRecords.toLocaleString()} (${progress}%) - ${totalUpdates} total updates`
				)
			}

			await this.sleep(50) // Small delay
		}

		this.stats.totalProcessed += processedCount
		this.stats.successfulUpdates += totalUpdates
	}

	/**
	 * Process records using organization-based batch approach (not row-level)
	 */
	async processBatch(tableConfig, offset, limit) {
		const { name } = tableConfig
		let retryCount = 0

		while (retryCount < this.maxRetries) {
			try {
				// Use organization-based batch processing instead of row-level
				// Get distinct organizations from the table slice
				const primaryKey = tableConfig.primaryKey || 'id'
				const orderByClause = Array.isArray(primaryKey) ? primaryKey.join(', ') : primaryKey

				// First check if this slice has any records
				const [recordCheck] = await this.sequelize.query(
					`SELECT COUNT(*) as count FROM ${name} ORDER BY ${orderByClause} LIMIT ${limit} OFFSET ${offset}`,
					{ type: this.sequelize.QueryTypes.SELECT }
				)

				if (recordCheck.count === 0) {
					return { processed: 0, updates: 0 }
				}

				// Get distinct organizations from this batch slice with organization lookup
				let distinctOrgsQuery
				if (tableConfig.columns.organization_id) {
					// Table has organization_id - use direct lookup
					distinctOrgsQuery = `
						SELECT DISTINCT t.organization_id::text as org_id
						FROM (
							SELECT organization_id FROM ${name} 
							ORDER BY ${orderByClause} 
							LIMIT ${limit} OFFSET ${offset}
						) t
						WHERE t.organization_id IS NOT NULL
						ORDER BY org_id
					`
				} else if (tableConfig.columns.user_id) {
					// Table has user_id - lookup via user_extensions
					const userIdColumn = tableConfig.columns.user_id
					const defaultTenantCode = process.env.DEFAULT_ORGANISATION_CODE || 'default'
					distinctOrgsQuery = `
						SELECT DISTINCT ue.organization_id::text as org_id
						FROM (
							SELECT ${userIdColumn} FROM ${name} 
							ORDER BY ${orderByClause} 
							LIMIT ${limit} OFFSET ${offset}
						) t
						INNER JOIN user_extensions ue ON t.${userIdColumn} = ue.user_id
						WHERE ue.organization_id IS NOT NULL
						AND ue.tenant_code IS NOT NULL
						AND ue.tenant_code != '${defaultTenantCode}'
						ORDER BY org_id
					`
				} else {
					// No organization context - skip batch processing
					return { processed: limit, updates: 0 }
				}

				const [orgBatch] = await this.sequelize.query(distinctOrgsQuery, {
					type: this.sequelize.QueryTypes.SELECT,
				})

				if (orgBatch.length === 0) {
					return { processed: limit, updates: 0 }
				}

				// Execute batch updates using organization-based approach
				const totalUpdated = await this.executeBatchUpdates(name, orgBatch, tableConfig, offset, limit)

				return { processed: limit, updates: totalUpdated }
			} catch (error) {
				retryCount++
				console.error(`❌ Organization batch failed (attempt ${retryCount}/${this.maxRetries}):`, error.message)

				if (retryCount >= this.maxRetries) {
					this.stats.failedUpdates += limit
					throw error
				}

				await this.sleep(this.retryDelay * retryCount)
			}
		}
	}

	/**
	 * Execute batch updates using organization-based GROUP BY approach
	 */
	async executeBatchUpdates(tableName, orgBatch, tableConfig, offset, limit) {
		if (orgBatch.length === 0) return 0

		const transaction = await this.sequelize.transaction()
		let totalUpdated = 0

		try {
			// Process each organization individually for atomic batch updates
			for (const org of orgBatch) {
				const setClauses = []

				// Build SET clause based on available update columns
				if (tableConfig.updateColumns.includes('tenant_code')) {
					// Get tenant_code from lookup cache
					const orgData = this.orgLookupCache.get(org.org_id)
					if (orgData) {
						setClauses.push(`tenant_code = '${orgData.tenant_code}'`)
					}
				}

				if (tableConfig.updateColumns.includes('organization_code')) {
					// Get organization_code from lookup cache
					const orgData = this.orgLookupCache.get(org.org_id)
					if (orgData) {
						setClauses.push(`organization_code = '${orgData.organization_code}'`)
					}
				}

				if (setClauses.length === 0) continue

				setClauses.push('updated_at = NOW()')

				// Build UPDATE query based on table type
				let updateQuery
				const primaryKey = tableConfig.primaryKey || 'id'
				const orderByClause = Array.isArray(primaryKey) ? primaryKey.join(', ') : primaryKey

				if (tableConfig.columns.organization_id) {
					// Direct organization_id lookup
					updateQuery = `
						UPDATE ${tableName} 
						SET ${setClauses.join(', ')}
						WHERE organization_id::text = '${org.org_id.replace(/'/g, "''")}'
						AND ${tableName}.id IN (
							SELECT id FROM ${tableName} 
							WHERE organization_id::text = '${org.org_id.replace(/'/g, "''")}'\n							ORDER BY ${orderByClause} 
							LIMIT ${limit} OFFSET ${offset}
						)
					`
				} else if (tableConfig.columns.user_id) {
					// user_id lookup via user_extensions
					const userIdColumn = tableConfig.columns.user_id
					const defaultTenantCode = process.env.DEFAULT_ORGANISATION_CODE || 'default'
					updateQuery = `
						UPDATE ${tableName} 
						SET ${setClauses.join(', ')}
						FROM user_extensions ue
						WHERE ${tableName}.${userIdColumn} = ue.user_id
						AND ue.organization_id::text = '${org.org_id.replace(/'/g, "''")}'
						AND ue.tenant_code IS NOT NULL
						AND ue.tenant_code != '${defaultTenantCode}'
						AND ${tableName}.id IN (
							SELECT t.id FROM ${tableName} t
							INNER JOIN user_extensions ue2 ON t.${userIdColumn} = ue2.user_id
							WHERE ue2.organization_id::text = '${org.org_id.replace(/'/g, "''")}'\n							ORDER BY t.${orderByClause} 
							LIMIT ${limit} OFFSET ${offset}
						)
					`
				} else {
					// No organization context - skip
					continue
				}

				const [, metadata] = await this.sequelize.query(updateQuery, { transaction })
				totalUpdated += metadata.rowCount || 0
			}

			await transaction.commit()
			return totalUpdated
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	}

	/**
	 * Check table columns
	 */
	async checkTableColumns(tableName) {
		try {
			const [columns] = await this.sequelize.query(`
				SELECT column_name 
				FROM information_schema.columns 
				WHERE table_name = '${tableName}' 
				AND table_schema = 'public'
			`)

			return columns.map((col) => col.column_name)
		} catch (error) {
			return []
		}
	}

	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	/**
	 * Print final statistics
	 */
	printStats() {
		const duration = Math.round((Date.now() - this.stats.startTime) / 1000)
		const minutes = Math.floor(duration / 60)
		const seconds = duration % 60

		console.log('\n🎯 CITUS MIGRATION COMPLETED!')
		console.log('='.repeat(50))
		console.log(`⏱️  Duration: ${minutes}m ${seconds}s`)
		console.log(`📊 Total processed: ${this.stats.totalProcessed.toLocaleString()}`)
		console.log(`✅ Successful updates: ${this.stats.successfulUpdates.toLocaleString()}`)
		console.log(`❌ Failed updates: ${this.stats.failedUpdates.toLocaleString()}`)
		console.log(`🔄 Tables undistributed: ${this.stats.tablesUndistributed}`)
		console.log(`🔄 Tables redistributed: ${this.stats.tablesRedistributed}`)
		console.log(`🎉 Success rate: ${Math.round((this.stats.successfulUpdates / this.stats.totalProcessed) * 100)}%`)
	}

	/**
	 * Main execution method
	 */
	async execute() {
		try {
			console.log('🚀 Starting Data Migration with data_codes.csv strategy (REFRESHED)...')
			console.log('='.repeat(60))

			await this.sequelize.authenticate()
			console.log('✅ Database connection established')

			// Check if Citus is enabled
			const citusEnabled = await this.isCitusEnabled()
			console.log(`🔧 Citus enabled: ${citusEnabled ? 'Yes' : 'No'}`)

			await this.loadLookupData()

			// PHASE 1: Process tables with organization_id using GROUP BY strategy
			await this.processTablesWithOrgId()

			// PHASE 2: Process tables with user_id using user_extensions data
			await this.processTablesWithUserId()

			// PHASE 3: Handle Citus distribution if enabled
			if (citusEnabled) {
				await this.handleCitusDistribution()
			} else {
				console.log('\n⚠️  Citus not enabled, skipping distribution logic')
			}

			this.printStats()
		} catch (error) {
			console.error('❌ Migration failed:', error)
			process.exit(1)
		} finally {
			await this.sequelize.close()
		}
	}

	/**
	 * Handle Citus distribution logic (only if Citus is present)
	 */
	async handleCitusDistribution() {
		console.log('\n🔄 PHASE 3: Handling Citus distribution...')
		console.log('='.repeat(70))

		const allTables = [...this.tablesWithOrgId, ...this.tablesWithUserId]
		let distributedCount = 0

		for (const tableConfig of allTables) {
			const { name, hasPartitionKey } = tableConfig

			if (hasPartitionKey) {
				try {
					const isDistributed = await this.isTableDistributed(name)

					if (!isDistributed) {
						await this.redistributeTable(name)
						distributedCount++
					} else {
						console.log(`✅ Table ${name} already distributed`)
					}
				} catch (error) {
					console.log(`⚠️  Could not distribute ${name}: ${error.message}`)
				}
			}
		}

		console.log(`✅ Distribution complete: ${distributedCount} tables redistributed`)
	}

	/**
	 * Log detailed update results for a table (moved from migration)
	 */
	async logTableUpdateResults(tableName) {
		try {
			const defaultTenantCode = process.env.DEFAULT_ORGANISATION_CODE || 'default'

			// Get total row count
			const [totalResult] = await this.sequelize.query(`SELECT COUNT(*) as total_count FROM ${tableName}`)
			const totalRows = totalResult[0].total_count || 0

			// Get updated row count (non-default tenant_code)
			const [updatedResult] = await this.sequelize.query(`
				SELECT COUNT(*) as updated_count 
				FROM ${tableName} 
				WHERE tenant_code IS NOT NULL AND tenant_code != '${defaultTenantCode}'
			`)
			const updatedRows = updatedResult[0].updated_count || 0

			// Get remaining row count (still default or null)
			const [remainingResult] = await this.sequelize.query(`
				SELECT COUNT(*) as remaining_count 
				FROM ${tableName} 
				WHERE tenant_code = '${defaultTenantCode}' OR tenant_code IS NULL
			`)
			const remainingRows = remainingResult[0].remaining_count || 0

			console.log(`    📊 ${tableName}: ${totalRows} total, ${updatedRows} updated, ${remainingRows} remaining`)
		} catch (error) {
			console.log(`    ⚠️  Could not get detailed stats for ${tableName}: ${error.message}`)
		}
	}
}

// Execute migration if run directly
if (require.main === module) {
	const migrator = new MentoringDataMigrator()
	migrator.execute()
}

module.exports = MentoringDataMigrator
