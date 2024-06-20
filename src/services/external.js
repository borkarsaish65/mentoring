'use strict'
const responses = require('@helpers/responses')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const IdMappingQueries = require('@database/queries/idMapping')
const organisationExtensionQueries = require('@database/queries/organisationExtension')
const mentorsService = require('@services/mentors')
const menteesService = require('@services/mentees')
const externalRequests = require('@requests/external')

module.exports = class ExternalHelper {
	static async externalWrapper(userExternalId) {
		try {
			console.log('EXTERNAL USER ID: ', userExternalId)
			const userDetails = await externalRequests.getUserDetails(userExternalId)
			await this.createOrg(userDetails.data.result.response.rootOrg)

			const userData = {
				id: userDetails.data.result.response.id,
				org: {
					id: userDetails.data.result.response.rootOrgId,
				},
				roles: [{ title: 'mentor' }, { title: 'org_admin' }, { title: 'session_manager' }],
			}
			console.log('USER DATA: ', userData)
			const result = await this.createUser(userData)
			console.log('RESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSULT: ', result)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'ENTITY_FETCHED_SUCCESSFULLY',
				result: userDetails.data,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
	static async createOrg(orgData) {
		try {
			console.log({ orgData })
			const idUuidMapping = await IdMappingQueries.create({
				uuid: orgData.id,
			})
			const extensionData = {
				...common.DEFAULT_ORGANISATION_POLICY,
				organization_id: idUuidMapping.id,
				created_by: 1,
				updated_by: 1,
			}
			const orgExtension = await organisationExtensionQueries.upsert(extensionData)
			return orgExtension.toJSON()
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async createUser(userData) {
		try {
			const isAMentor = userData.roles.some((role) => role.title == common.MENTOR_ROLE)
			const idUuidMapping = await IdMappingQueries.create({
				uuid: userData.id,
			})
			const orgId = await IdMappingQueries.getIdByUuid(userData.org.id)
			console.log('ORG ID: ', orgId)
			console.log('IS A MENTOR: ', isAMentor)
			const user = isAMentor
				? await mentorsService.createMentorExtension(userData, idUuidMapping.id, orgId)
				: await menteesService.createMenteeExtension(userData, idUuidMapping.id, orgId)

			console.log('USERRR: ', user)
			return user.result
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
