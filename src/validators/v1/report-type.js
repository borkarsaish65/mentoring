module.exports = {
	create: (req) => {
		req.checkBody('title')
			.notEmpty()
			.withMessage('title field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('title should not contain any spaces')
	},

	getReportById: (req) => {
		req.checkQuery('id').notEmpty().withMessage('id is required')
	},

	update: (req) => {
		req.checkQuery('id').notEmpty().withMessage('id is required')

		req.checkBody('title')
			.optional()
			.withMessage('title field is empty')
			.matches(/^[a-z_]+$/)
			.withMessage('title should not contain any spaces')
	},

	delete: (req) => {
		req.checkQuery('id').notEmpty().withMessage('id is required')
	},
}
