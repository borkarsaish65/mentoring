const moment = require('moment')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		const emailTemplates = [
			{
				code: 'mentor_deleted_session_deletion_email',
				subject: 'Mentor Session Deleted ',
				body: '<p>Hi,</p><p>{nameOfTheSession}</p><p>This session has been deleted. Mentor for this session is no longer available. </p> ',
			},
			{
				code: 'mentor_deleted_request_session_email',
				subject: 'Request Session Deleted',
				body: '<p>Hi,</p><p>{nameOfTheSession}</p><p>The session request is deleted because the mentor is no longer available. </p> ',
			},
		]

		let notificationTemplateData = []
		emailTemplates.forEach(async function (emailTemplate) {
			emailTemplate['status'] = 'active'
			emailTemplate['type'] = 'email'
			emailTemplate['updated_at'] = moment().format()
			emailTemplate['created_at'] = moment().format()
			emailTemplate['organization_id'] = defaultOrgId
			emailTemplate['email_footer'] = 'email_footer'
			emailTemplate['email_header'] = 'email_header'

			notificationTemplateData.push(emailTemplate)
		})

		await queryInterface.bulkInsert('notification_templates', notificationTemplateData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('notification_templates', null, {})
	},
}
