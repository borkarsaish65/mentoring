module.exports = {
	create: (req) => {
		req.checkBody('friend_id')
			.notEmpty()
			.withMessage('friend_id is required')
			.isString()
			.withMessage('friend_id must be a string')

		req.checkBody('title')
			.notEmpty()
			.withMessage('title is required')
			.isString()
			.withMessage('title must be a string')

		req.checkBody('agenda')
			.notEmpty()
			.withMessage('agenda is required')
			.isString()
			.withMessage('agenda must be a string')
			.custom((value) => {
				const wordCount = value.trim().split(/\s+/).length
				if (wordCount > 300) {
					throw new Error('agenda must be 300 words or fewer')
				}
				return true
			})

		req.checkBody('title')
			.optional()
			.trim()
			.notEmpty()
			.withMessage('title field is empty')
			.isString()
			.withMessage('title must be a string')
			.matches(/^[a-zA-Z0-9\-.,\s]+$/)
			.withMessage('invalid title')

		req.checkBody('start_date')
			.notEmpty()
			.withMessage('start_date field is required')
			.isInt()
			.withMessage('start_date must be an integer')

		req.checkBody('end_date')
			.notEmpty()
			.withMessage('end_date field is empty')
			.isInt()
			.withMessage('end_date must be an integer')

		req.checkBody('medium')
			.notEmpty()
			.withMessage('medium field is empty')
			.isArray({ min: 1 })
			.withMessage('medium must be an array')

		req.checkBody('time_zone')
			.optional()
			.isString()
			.withMessage('time_zone must be a string')
			.matches(/^[a-zA-Z]+\/[a-zA-Z_]+$/)
			.withMessage('invalid time_zone ')
	},

	pendingList: (req) => {},

	listAll: (req) => {},

	getDetails: (req) => {
		req.checkBody('user_id')
			.notEmpty()
			.withMessage('user_id is required')
			.isString()
			.withMessage('user_id must be a string')
	},

	accept: (req) => {
		req.checkBody('user_id')
			.notEmpty()
			.withMessage('user_id is required')
			.isString()
			.withMessage('user_id must be a string')
	},

	reject: (req) => {
		req.checkBody('user_id')
			.notEmpty()
			.withMessage('user_id is required')
			.isString()
			.withMessage('user_id must be a string')
	},
}
