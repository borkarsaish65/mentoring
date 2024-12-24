const formQueries = require('../database/queries/form')
async function getAllFormsVersion(orgIds) {
	try {
		return await formQueries.findAllTypeFormVersion(orgIds)
	} catch (error) {
		console.error(error)
	}
}
module.exports = { getAllFormsVersion }
