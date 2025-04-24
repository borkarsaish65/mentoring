const requestSession = require('@database/models/index').RequestSession
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

exports.addSessionRequest = async (userId, friendId, Agenda, startDate, endDate, Title, Meta) => {
	try {
		const result = await sequelize.transaction(async (t) => {
			const SessionRequestData = [
				{
					user_id: userId,
					friend_id: friendId,
					status: common.CONNECTIONS_STATUS.REQUESTED,
					title: Title,
					agenda: Agenda,
					start_date: startDate,
					end_date: endDate,
					created_by: userId,
					updated_by: userId,
					meta: Meta,
				},
				{
					user_id: friendId,
					friend_id: userId,
					status: common.CONNECTIONS_STATUS.REQUESTED,
					title: Title,
					agenda: Agenda,
					start_date: startDate,
					end_date: endDate,
					created_by: userId,
					updated_by: userId,
					meta: Meta,
				},
			]

			const requests = await requestSession.bulkCreate(SessionRequestData, { transaction: t })

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

		const whereClause = {
			user_id: userId,
		}

		// If status is passed, add it to the where clause
		if (status) {
			whereClause.status = status
		} else {
			// else fetch all the main statuses
			whereClause.status = {
				[Op.in]: [
					common.CONNECTIONS_STATUS.ACCEPTED,
					common.CONNECTIONS_STATUS.REQUESTED,
					common.CONNECTIONS_STATUS.REJECTED,
				],
			}
		}

		const results = await requestSession.findAll({
			where: whereClause,
			offset,
			limit,
			raw: true,
		})

		// Get total count without pagination
		const totalCount = await requestSession.count({
			where: whereClause,
		})

		return {
			count: totalCount,
			rows: results,
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

exports.approveRequest = async (userId, friendId, startDate, endDate, sessionId) => {
	const t = await sequelize.transaction() // start transaction

	try {
		const updateData = {
			status: common.CONNECTIONS_STATUS.ACCEPTED,
			session_id: sessionId,
			created_by: friendId,
			updated_by: userId,
		}

		const requests = await requestSession.update(updateData, {
			where: {
				[Op.or]: [
					{ user_id: userId, friend_id: friendId },
					{ user_id: friendId, friend_id: userId },
				],
				status: common.CONNECTIONS_STATUS.REQUESTED,
				created_by: friendId,
				start_date: startDate,
				end_date: endDate,
			},
			transaction: t,
			individualHooks: true,
		})

		await t.commit()
		return requests
	} catch (error) {
		await t.rollback()
		throw error
	}
}

exports.rejectRequest = async (userId, friendId, rejectReason, startDate, endDate) => {
	try {
		let updateData = {
			status: common.CONNECTIONS_STATUS.REJECTED,
			updated_by: userId,
		}

		if (rejectReason) {
			updateData.reject_reason = { reason: rejectReason }
		}

		return await requestSession.update(updateData, {
			where: {
				status: common.CONNECTIONS_STATUS.REQUESTED,
				[Op.or]: [
					{ user_id: userId, friend_id: friendId },
					{ user_id: friendId, friend_id: userId },
				],
				created_by: friendId,
				start_date: startDate,
				end_date: endDate,
			},
			individualHooks: true,
		})
	} catch (error) {
		throw error
	}
}
exports.findOneRequest = async (userId, friendId, startDate, endDate) => {
	try {
		const sessionRequest = await requestSession.findOne({
			where: {
				[Op.or]: [
					{ user_id: userId, friend_id: friendId },
					{ user_id: friendId, friend_id: userId },
				],
				status: common.CONNECTIONS_STATUS.REQUESTED,
				created_by: friendId,
				start_date: startDate,
				end_date: endDate,
			},
			raw: true,
		})

		return sessionRequest
	} catch (error) {
		throw error
	}
}

exports.checkPendingRequest = async (userId, friendId) => {
	try {
		const result = await requestSession.findAndCountAll({
			where: {
				user_id: userId,
				friend_id: friendId,
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
		})
		return result
	} catch (error) {
		throw error
	}
}

exports.getRequestSessions = async (userId, friendId, startDate, endDate, status) => {
	try {
		const whereClause = {
			user_id: userId,
			friend_id: friendId,
			status: status,
		}

		if (startDate && endDate) {
			whereClause.start_date = startDate
			whereClause.end_date = endDate
		}

		return await requestSession.findOne({
			where: whereClause,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}
