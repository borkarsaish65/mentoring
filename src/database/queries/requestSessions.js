const requestSession = require('@database/models/index').RequestSession
const requestSessionMapping = require('@database/models/index').SessionRequestMapping
const { Op } = require('sequelize')
const sequelize = require('@database/models/index').sequelize

const common = require('@constants/common')
const MenteeExtension = require('@database/models/index').UserExtension
const { QueryTypes } = require('sequelize')

exports.getColumns = async () => {
	try {
		return await Object.keys(requestSession.rawAttributes)
	} catch (error) {
		return error
	}
}

exports.getModelName = async () => {
	try {
		return await requestSession.name
	} catch (error) {
		return error
	}
}

exports.addSessionRequest = async (requestorId, requesteeId, Agenda, startDate, endDate, Title, Meta) => {
	try {
		const result = await sequelize.transaction(async (t) => {
			const SessionRequestData = [
				{
					requestor_id: requestorId,
					requestee_id: requesteeId,
					status: common.CONNECTIONS_STATUS.REQUESTED,
					title: Title,
					agenda: Agenda,
					start_date: startDate,
					end_date: endDate,
					created_by: requestorId,
					updated_by: requestorId,
					meta: Meta,
				},
			]

			const requests = await requestSession.bulkCreate(SessionRequestData, { transaction: t })
			const requestResult = requests[0].get({ plain: true })

			const SessionRequestMappingData = [
				{
					requestee_id: requesteeId,
					session_request_id: requestResult.id,
				},
			]
			const requestsMapping = await requestSessionMapping.bulkCreate(SessionRequestMappingData, {
				transaction: t,
			})
			return requests[0].get({ plain: true })
		})

		return result
	} catch (error) {
		throw error
	}
}

exports.getAllRequests = async (userId, page, pageSize, status) => {
	try {
		const currentPage = Number.isInteger(page) && page > 0 ? page : 1
		const limit = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10
		const offset = (currentPage - 1) * limit

		// Prepare status filter
		const statusFilter =
			status != ''
				? status
				: {
						[Op.in]: [
							common.CONNECTIONS_STATUS.ACCEPTED,
							common.CONNECTIONS_STATUS.REQUESTED,
							common.CONNECTIONS_STATUS.REJECTED,
						],
				  }

		const sessionRequest = await requestSession.findAll({
			where: {
				requestor_id: userId,
				status: statusFilter,
			},
		})

		const sessionRequestData = sessionRequest.map((session) => session.dataValues)

		const sessionRequestMapping = await requestSessionMapping.findAll({
			where: {
				requestee_id: userId,
			},
		})

		const sessionRequestIds = sessionRequestMapping.map((session) => session.dataValues.session_request_id)

		const sessionMappingDetails = await requestSession.findAll({
			where: {
				id: {
					[Op.in]: sessionRequestIds, // Using Sequelize.Op.in to filter by multiple ids
				},
				status: statusFilter, // Your status filter
			},
		})
		const sessionMappingDetailsData = sessionMappingDetails.map((session) => session.dataValues)
		const combinedData = [...sessionRequestData, ...sessionMappingDetailsData]
		return {
			count: combinedData.length,
			rows: combinedData,
		}
	} catch (error) {
		console.error('Error in getAllRequests:', error)
		throw error
	}
}

exports.getpendingRequests = async (userId, page, pageSize) => {
	try {
		const currentPage = Number.isInteger(page) && page > 0 ? page : 1
		const limit = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10
		const offset = (currentPage - 1) * limit

		const result = await requestSession.findAndCountAll({
			where: {
				user_id: userId,
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
			raw: true,
			limit,
			offset,
		})

		return result
	} catch (error) {
		throw error
	}
}

exports.approveRequest = async (userId, requestSessionId, sessionId) => {
	const t = await sequelize.transaction() // start transaction

	try {
		const updateData = {
			status: common.CONNECTIONS_STATUS.ACCEPTED,
			session_id: sessionId,
			updated_by: userId,
		}

		const requests = await requestSession.update(updateData, {
			where: {
				status: common.CONNECTIONS_STATUS.REQUESTED,
				id: requestSessionId,
			},
			transaction: t,
			individualHooks: true,
		})

		await t.commit()
		return requests[1]
	} catch (error) {
		await t.rollback()
		throw error
	}
}

exports.rejectRequest = async (userId, requestSessionId, rejectReason) => {
	try {
		let updateData = {
			status: common.CONNECTIONS_STATUS.REJECTED,
			updated_by: userId,
			reject_reason: rejectReason ? rejectReason : null,
		}

		return await requestSession.update(updateData, {
			where: {
				status: common.CONNECTIONS_STATUS.REQUESTED,
				id: requestSessionId,
			},
			individualHooks: true,
		})
	} catch (error) {
		throw error
	}
}

exports.findOneRequest = async (requestSessionId) => {
	try {
		const sessionRequest = await requestSession.findOne({
			where: {
				id: requestSessionId,
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
			raw: true,
		})

		return sessionRequest
	} catch (error) {
		throw error
	}
}

exports.checkPendingRequest = async (requestorId, requesteeId) => {
	try {
		const result = await requestSession.findAndCountAll({
			where: {
				requestor_id: requestorId,
				requestee_id: requesteeId,
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
		})
		return result
	} catch (error) {
		throw error
	}
}

exports.getRequestSessions = async (requestSessionId) => {
	try {
		const whereClause = {
			id: requestSessionId,
		}
		return await requestSession.findOne({
			where: whereClause,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}
