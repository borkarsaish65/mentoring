const { Sequelize } = require('sequelize')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
require('dotenv').config()

/**
 * Citus-Compatible Data Migration Script for Mentoring Service
 * Handles partition value updates by temporarily undistributing tables
 * Updates tenant_code and organization_code based on user service data
 */

class CitusMentoringDataMigrator {
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
		this.batchSize = 1000
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

		// Tables to process - UPDATE BOTH tenant_code AND organization_code
		this.tablesToProcess = [
			{
				name: 'availabilities',
				columns: { organization_id: 'organization_id', user_id: 'user_id' },
				updateColumns: ['tenant_code', 'organization_code'], // Update both
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
				columns: { organization_id: 'organization_id', user_id: 'created_by' },
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
				primaryKey: ['tenant_code', 'organization_id'], // Composite primary key
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
				name: 'user_extensions',
				columns: { user_id: 'user_id' },
				updateColumns: ['tenant_code', 'organization_code'],
				hasPartitionKey: true,
				primaryKey: ['tenant_code', 'user_id'], // Composite primary key
			},
			{
				name: 'sessions',
				columns: { organization_id: 'mentor_organization_id', user_id: 'mentor_user_id' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'session_attendees',
				columns: { user_id: 'user_id' },
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
				columns: { user_id: 'user_id' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
			{
				name: 'connections',
				columns: { user_id: 'user_id' },
				updateColumns: ['tenant_code'],
				hasPartitionKey: true,
			},
		]
	}

	/**
	 * Load lookup data from CSV files
	 */
	async loadLookupData() {
		console.log('🔄 Loading lookup data from CSV files...')

		try {
			await this.loadOrganizationData()
			await this.loadUserData()
			await this.loadUserOrganizationData()

			console.log(`✅ Loaded lookup data:`)
			console.log(`   - Organizations: ${this.orgLookupCache.size}`)
			console.log(`   - Users: ${this.userLookupCache.size}`)
			console.log(`   - User-Org mappings: ${this.userOrgCache.size}`)
		} catch (error) {
			console.error('❌ Failed to load lookup data:', error)
			throw error
		}
	}

	async loadOrganizationData() {
		const csvPath = path.join(__dirname, 'data', 'organizations.csv')
		if (!fs.existsSync(csvPath)) {
			console.log('⚠️  organizations.csv not found, using defaults')
			return
		}

		return new Promise((resolve, reject) => {
			fs.createReadStream(csvPath)
				.pipe(csv())
				.on('data', (row) => {
					if (row.id && row.code && row.tenant_code) {
						this.orgLookupCache.set(row.id, {
							organization_code: row.code,
							tenant_code: row.tenant_code,
						})
					}
				})
				.on('end', () => {
					console.log(`✅ Loaded ${this.orgLookupCache.size} organizations`)
					resolve()
				})
				.on('error', reject)
		})
	}

	async loadUserData() {
		const csvPath = path.join(__dirname, 'data', 'users.csv')
		if (!fs.existsSync(csvPath)) {
			console.log('⚠️  users.csv not found')
			return
		}

		return new Promise((resolve, reject) => {
			fs.createReadStream(csvPath)
				.pipe(csv())
				.on('data', (row) => {
					if (row.id && row.tenant_code) {
						this.userLookupCache.set(row.id, {
							tenant_code: row.tenant_code,
						})
					}
				})
				.on('end', () => {
					console.log(`✅ Loaded ${this.userLookupCache.size} users`)
					resolve()
				})
				.on('error', reject)
		})
	}

	async loadUserOrganizationData() {
		const csvPath = path.join(__dirname, 'data', 'user_organizations.csv')
		if (!fs.existsSync(csvPath)) {
			console.log('⚠️  user_organizations.csv not found')
			return
		}

		return new Promise((resolve, reject) => {
			fs.createReadStream(csvPath)
				.pipe(csv())
				.on('data', (row) => {
					if (row.user_id && row.organization_code && row.tenant_code) {
						const userId = row.user_id
						if (!this.userOrgCache.has(userId)) {
							this.userOrgCache.set(userId, [])
						}
						this.userOrgCache.get(userId).push({
							organization_code: row.organization_code,
							tenant_code: row.tenant_code,
						})
					}
				})
				.on('end', () => {
					console.log(`✅ Loaded user-organization relationships`)
					resolve()
				})
				.on('error', reject)
		})
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
	 * Get lookup data for a record
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

		// Try user_id lookup
		if (columns.user_id && record[columns.user_id]) {
			const userId = record[columns.user_id]

			const userData = this.userLookupCache.get(userId)
			if (userData) {
				tenantCode = userData.tenant_code
			}

			const userOrgs = this.userOrgCache.get(userId)
			if (userOrgs && userOrgs.length > 0) {
				const firstOrg = userOrgs[0]
				organizationCode = firstOrg.organization_code
				tenantCode = firstOrg.tenant_code
				return { tenantCode, organizationCode, source: 'user_id' }
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

			// Step 1: Undistribute table if we need to update partition key or if it's distributed
			let wasDistributed = false
			if (hasPartitionKey && needsTenantCodeUpdate) {
				wasDistributed = await this.undistributeTable(name)
				console.log(`🔄 Undistributed ${name} to update partition key (tenant_code)`)
			} else if (hasPartitionKey) {
				wasDistributed = await this.isTableDistributed(name)
			}

			try {
				// Step 2: Process all updates (including tenant_code when undistributed)
				await this.processTableUpdates(tableConfig, totalRecords, availableUpdateColumns)

				// Step 3: Redistribute table if it was distributed before
				if (wasDistributed && needsTenantCodeUpdate) {
					console.log(`🔄 Redistributing ${name} with updated tenant_code...`)
					await this.redistributeTable(name)
				}
			} catch (error) {
				console.error(`❌ Error updating table ${name}:`, error)

				// Try to redistribute table even if updates failed
				if (wasDistributed && needsTenantCodeUpdate) {
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
	 * Process a batch of records
	 */
	async processBatch(tableConfig, offset, limit) {
		const { name } = tableConfig
		let retryCount = 0

		while (retryCount < this.maxRetries) {
			try {
				// Fetch batch - use correct primary key for each table
				const primaryKey = tableConfig.primaryKey || 'id'
				const orderByClause = Array.isArray(primaryKey) ? primaryKey.join(', ') : primaryKey
				const records = await this.sequelize.query(
					`SELECT * FROM ${name} ORDER BY ${orderByClause} LIMIT ${limit} OFFSET ${offset}`,
					{ type: Sequelize.QueryTypes.SELECT }
				)

				if (records.length === 0) {
					return { processed: 0, updates: 0 }
				}

				// Process updates - FORCE UPDATE ALL RECORDS regardless of existing values
				const updates = []
				for (const record of records) {
					const lookupData = this.getLookupData(record, tableConfig)

					const updateFields = {}

					// Always update tenant_code if column exists (table must be undistributed)
					if (tableConfig.updateColumns.includes('tenant_code')) {
						updateFields.tenant_code = lookupData.tenantCode
					}

					// Always update organization_code if column exists
					if (tableConfig.updateColumns.includes('organization_code')) {
						updateFields.organization_code = lookupData.organizationCode
					}

					// Always add to updates if any fields need updating
					if (Object.keys(updateFields).length > 0) {
						const primaryKey = tableConfig.primaryKey || 'id'

						if (Array.isArray(primaryKey)) {
							// Composite primary key
							const primaryKeyValues = {}
							const primaryKeyColumns = primaryKey
							for (const col of primaryKeyColumns) {
								primaryKeyValues[col] = record[col]
							}
							updates.push({
								primaryKeyValues,
								primaryKeyColumns,
								isComposite: true,
								...updateFields,
							})
						} else {
							// Single primary key
							updates.push({
								primaryKeyValue: record[primaryKey],
								primaryKeyColumn: primaryKey,
								isComposite: false,
								...updateFields,
							})
						}
					}
				}

				// Execute batch updates
				if (updates.length > 0) {
					await this.executeSimpleUpdates(name, updates, tableConfig)
				}

				return { processed: records.length, updates: updates.length }
			} catch (error) {
				retryCount++
				console.error(`❌ Batch failed (attempt ${retryCount}/${this.maxRetries}):`, error.message)

				if (retryCount >= this.maxRetries) {
					this.stats.failedUpdates += limit
					throw error
				}

				await this.sleep(this.retryDelay * retryCount)
			}
		}
	}

	/**
	 * Execute simple updates without CASE statements
	 */
	async executeSimpleUpdates(tableName, updates, tableConfig) {
		if (updates.length === 0) return

		const transaction = await this.sequelize.transaction()

		try {
			// Use individual UPDATE statements for simplicity
			for (const update of updates) {
				const setClauses = []
				const replacements = {}

				// Build SET clauses dynamically
				if (update.tenant_code !== undefined) {
					setClauses.push('tenant_code = :tenantCode')
					replacements.tenantCode = update.tenant_code
				}
				if (update.organization_code !== undefined) {
					setClauses.push('organization_code = :orgCode')
					replacements.orgCode = update.organization_code
				}

				// Build WHERE clause based on primary key type
				let whereClause
				if (update.isComposite) {
					// Composite primary key: WHERE col1 = :val1 AND col2 = :val2
					const whereConditions = []
					for (const col of update.primaryKeyColumns) {
						whereConditions.push(`${col} = :${col}`)
						replacements[col] = update.primaryKeyValues[col]
					}
					whereClause = whereConditions.join(' AND ')
				} else {
					// Single primary key: WHERE col = :val
					const primaryKeyColumn = update.primaryKeyColumn || 'id'
					whereClause = `${primaryKeyColumn} = :primaryKeyValue`
					replacements.primaryKeyValue = update.primaryKeyValue
				}

				const sql = `UPDATE ${tableName} SET ${setClauses.join(', ')}, updated_at = NOW() WHERE ${whereClause}`

				await this.sequelize.query(sql, {
					replacements,
					transaction,
				})
			}

			await transaction.commit()
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
			console.log('🚀 Starting Citus-Compatible Mentoring Service Data Migration...')
			console.log('='.repeat(60))

			await this.sequelize.authenticate()
			console.log('✅ Database connection established')

			await this.loadLookupData()

			// Process each table
			for (const tableConfig of this.tablesToProcess) {
				await this.processTable(tableConfig)
			}

			this.printStats()
		} catch (error) {
			console.error('❌ Migration failed:', error)
			process.exit(1)
		} finally {
			await this.sequelize.close()
		}
	}
}

// Execute migration if run directly
if (require.main === module) {
	const migrator = new CitusMentoringDataMigrator()
	migrator.execute()
}

module.exports = CitusMentoringDataMigrator
