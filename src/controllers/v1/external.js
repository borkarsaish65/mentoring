const externalServices = require('@services/external')
module.exports = class External {
	async create(req) {
		try {
			console.log()
			return await externalServices.externalWrapper(req.decodedToken.externalId)
		} catch (error) {
			console.log(error)
			return error
		}
	}
}
