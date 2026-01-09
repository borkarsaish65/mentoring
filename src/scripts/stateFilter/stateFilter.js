/*

this script connects to a database, queries entity types and entities, and migrates data between databases.
pass the required database connection details as command line arguments.
for example: --db=ip/user-db
eg command to run the script: node stateFilter.js   --userdb=postgresql://postgres:postgres@localhost:5432/elevate_user
*/
require('module-alias/register')
require('dotenv').config({ path: '../../.env' })
const { Sequelize } = require('sequelize')
const adminService = require('../../generics/materializedViews')
const { getDefaultOrgId } = require('@helpers/getDefaultOrgId')

/**
 * Parse CLI args of the form --key=value
 */
function parseArgs(argv) {
	return argv.slice(2).reduce((acc, arg) => {
		if (!arg.startsWith('--')) return acc
		const [key, value] = arg.replace(/^--/, '').split('=')
		acc[key] = value
		return acc
	}, {})
}

const args = parseArgs(process.argv)

if (!args.userdb) {
	throw new Error('Missing required argument --userdb=<databaseName>')
}

// Example: --db=ip/user-db
// Decide how this maps to connection config.
// Option A: use the db name directly with shared credentials
const sequelize = new Sequelize(args.userdb, {
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
	dialect: process.env.DB_DIALECT || 'postgres',
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	logging: false,
})

;(async () => {
	try {
		await sequelize.authenticate()
		console.log(`Connected to database: ${args.userdb}`)
		// continue with your logic here

		//query entity type with value=location
		let [entityType] = await sequelize.query(`
      SELECT id,value,label,status,allow_filtering,data_type,organization_id,parent_id,allow_custom_entities,has_entities,model_names,required,regex FROM entity_types WHERE value = 'location' limit 1
    `)

		if (!entityType) {
			throw new Error('Entity type not found')
		}

		console.log(entityType, '<------entityType')

		//fetch the entities with entity_type_id from above query
		const [entities] = await sequelize.query(
			`
      SELECT value,label,status,deleted_at FROM entities WHERE entity_type_id = $1`,
			{ bind: [entityType[0].id] }
		)

		console.log(entities, '<----------entities')

		//create entity_type in mentoring db with information got from step 2
		const targetDbUrl = process.env.DEV_DATABASE_URL
		console.log(targetDbUrl, 'Target Database URL...')

		if (!targetDbUrl) {
			throw new Error('Target database URL is not defined')
		}

		const mentoringDb = new Sequelize(targetDbUrl, {
			dialect: 'postgres',
			logging: false,
		})

		await mentoringDb.authenticate()
		const defaultOrgId = await getDefaultOrgId()
		const transaction = await mentoringDb.transaction()

		try {
			console.log(entityType, 'entityType')

			// Check if entity type exists
			const [existingEntityType] = await mentoringDb.query(`SELECT id FROM entity_types WHERE value = $1`, {
				bind: ['location'],
				transaction,
			})

			let singleEntityTypeId

			if (existingEntityType.length > 0) {
				singleEntityTypeId = existingEntityType[0].id
				console.log('Entity type already exists:', singleEntityTypeId)
			} else {
				let availableColumns = [
					'value',
					'label',
					'status',
					'allow_filtering',
					'data_type',
					'organization_id',
					'parent_id',
					'allow_custom_entities',
					'has_entities',
					'model_names',
					'required',
					'regex',
					'created_at',
					'updated_at',
				]

				if (!entityType.length) {
					await transaction.rollback()
					return
				}

				// determine columns once (intersection)
				let columns = availableColumns.filter((col) => entityType.some((row) => row[col] !== undefined))

				columns = [...columns, 'created_at', 'updated_at']

				if (!columns.length) {
					throw new Error('No valid columns to insert')
				}

				// build placeholders + values
				const values = []
				const now = new Date()
				const entityTypeToInsert = entityType.map((e) => ({
					...e,
					model_names: ['UserExtension'],
					created_at: now,
					updated_at: now,
					required: false,
					organization_id: defaultOrgId,
				}))

				const rowsSql = entityTypeToInsert.map((row, rowIndex) => {
					const rowPlaceholders = columns.map((col, colIndex) => {
						values.push(row[col] ?? null)
						return `$${rowIndex * columns.length + colIndex + 1}`
					})
					return `(${rowPlaceholders.join(', ')})`
				})

				console.log(`INSERT INTO entity_types (${columns.join(', ')})
				VALUES ${rowsSql.join(', ')}`)

				let result = await mentoringDb.query(
					`
				INSERT INTO entity_types (${columns.join(', ')})
				VALUES ${rowsSql.join(', ')}
				RETURNING id
				`,
					{ bind: values, transaction }
				)

				console.log(
					`INSERT INTO entity_types (${columns.join(', ')})
				VALUES ${rowsSql.join(', ')}`,
					values,
					'<--value'
				)
				//console.log(STOPPP)
				singleEntityTypeId = result[0][0].id
			}

			console.log(singleEntityTypeId, '<---singleEntityTypeId')

			//create entities in mentoring db with information got from step 3
			for (const entity of entities) {
				// Check for existence
				const [existingEntity] = await mentoringDb.query(
					`SELECT id FROM entities WHERE entity_type_id = $1 AND value = $2`,
					{ bind: [singleEntityTypeId, entity.value], transaction }
				)

				if (existingEntity.length === 0) {
					console.log('creating entity...')
					await mentoringDb.query(
						`INSERT INTO entities (entity_type_id, value,label,status,type,created_at,updated_at) VALUES ($1, $2, $3, $4, 'SYSTEM', NOW(), NOW())`,
						{
							bind: [singleEntityTypeId, entity.value, entity.label, entity.status],
							transaction,
						}
					)
				} else {
					console.log('entity already exists...')
				}
			}

			//query user_db get location column data then migrate to mentoring db user_extension table
			const [locationData] = await sequelize.query(`
			SELECT id, location FROM users where location IS NOT NULL
			`)

			console.log(locationData, 'locationData')
			console.log(locationData.length, '<---locationData count')

			if (locationData.length > 0) {
				const CHUNK_SIZE = 500
				for (let i = 0; i < locationData.length; i += CHUNK_SIZE) {
					const chunk = locationData.slice(i, i + CHUNK_SIZE)
					const chunkIds = chunk.map((c) => String(c.id))

					const [userExtensionData] = await mentoringDb.query(
						`SELECT user_id, meta FROM user_extensions WHERE user_id IN (:ids)`,
						{
							replacements: { ids: chunkIds },
							transaction,
						}
					)

					console.log(userExtensionData, '<---userExtensionData')

					for (let userData of userExtensionData) {
						let location =
							chunk.find((loc) => loc.id.toString() === userData.user_id.toString())?.location || null

						if (location) {
							if (!userData.meta || Object.keys(userData.meta).length === 0) {
								userData.meta = {
									location: location,
								}
							} else {
								userData.meta.location = location
							}

							await mentoringDb.query(`UPDATE user_extensions SET meta = $1 WHERE user_id = $2`, {
								bind: [JSON.stringify(userData.meta), userData.user_id],
								transaction,
							})
						}
					}
				}
			}

			await transaction.commit()
			await adminService.triggerViewBuild()
			console.log('Migration completed successfully.')
		} catch (err) {
			await transaction.rollback()
			throw err
		}
	} catch (err) {
		console.error('Database connection failed:', err)
		process.exit(1)
	}
})()
