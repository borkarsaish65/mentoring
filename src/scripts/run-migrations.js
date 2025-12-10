const { Umzug, SequelizeStorage } = require('umzug')
const { sequelize } = require('../src/database/models') // <-- this is where Sequelize is initialized

async function run() {
	try {
		console.log('Starting migrations...')

		const umzug = new Umzug({
			migrations: { glob: 'src/migrations/*.js' },
			context: sequelize.getQueryInterface(),
			storage: new SequelizeStorage({ sequelize }),
			logger: console,
		})

		await umzug.up() // <-- THIS is the real equivalent of `sequelize-cli db:migrate`

		console.log('MIGRATION_SUCCESS')
		process.exit(0)
	} catch (err) {
		console.error(err)
		process.exit(1)
	}
}

run()
