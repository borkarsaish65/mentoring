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

exports.getAllRequests = async (userId, page, pageSize) => {
	try {
		const currentPage = Number.isInteger(page) && page > 0 ? page : 1
		const limit = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10
		const offset = (currentPage - 1) * limit

		// 1. Get accepted requests from requestSession
		const accepted = await requestSession.findAll({
			where: {
				user_id: userId,
				status: common.CONNECTIONS_STATUS.ACCEPTED,
			},
			raw: true,
		})

		// 2. Get requested + accepted (non-deleted) from requestSessionRequests
		const requestedAccepted = await requestSession.findAll({
			where: {
				user_id: userId,
				status: {
					[Op.in]: [common.CONNECTIONS_STATUS.REQUESTED, common.CONNECTIONS_STATUS.ACCEPTED],
				},
				deleted_at: null,
			},
			raw: true,
		})

		// 3. Get rejected (deleted) from requestSessionRequests
		const rejected = await requestSession.findAll({
			where: {
				user_id: userId,
				status: common.CONNECTIONS_STATUS.REJECTED,
				deleted_at: {
					[Op.not]: null,
				},
			},
			paranoid: false, // allows soft-deleted entries to be queried
			raw: true,
		})

		// Merge all results
		const merged = [...accepted, ...requestedAccepted, ...rejected]

		// Deduplicate based on `id`, `session_id`, or (user_id + friend_id)
		// Assuming `id` is unique across both tables:
		const uniqueMerged = Object.values(
			merged.reduce((acc, row) => {
				acc[row.id] = row
				return acc
			}, {})
		)

		// Manual pagination (after deduplication)
		const paginatedRows = uniqueMerged.slice(offset, offset + limit)

		return {
			count: uniqueMerged.length,
			rows: paginatedRows,
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

exports.getRejectedSessionRequest = async (userId, friendId, startDate, endDate) => {
	try {
		const whereClause = {
			user_id: userId,
			friend_id: friendId,
			status: common.CONNECTIONS_STATUS.REJECTED,
			created_by: friendId,
		}

		if (startDate && endDate) {
			whereClause.start_date = startDate
			whereClause.end_date = endDate
		}

		return await requestSession.findOne({
			where: whereClause,
			paranoid: false,
			order: [['deleted_at', 'DESC']],
			raw: true,
		})
	} catch (error) {
		throw error
	}
}

exports.approveRequest = async (userId, friendId, Agenda, startDate, endDate, Title, sessionId, Meta) => {
	try {
		const requests = await sequelize.transaction(async (t) => {
			const deletedCount = await requestSession.destroy({
				where: {
					[Op.or]: [
						{ user_id: userId, friend_id: friendId },
						{ user_id: friendId, friend_id: userId },
					],
					status: common.CONNECTIONS_STATUS.REQUESTED,
					created_by: friendId,
				},
				individualHooks: true,
				transaction: t,
			})
			if (deletedCount != 2) {
				throw new Error('Error while deleting from "RequestSessions"')
			}

			const SessionRequestData = [
				{
					user_id: userId,
					friend_id: friendId,
					status: common.CONNECTIONS_STATUS.ACCEPTED,
					title: Title,
					agenda: Agenda,
					start_date: startDate,
					end_date: endDate,
					session_id: sessionId,
					created_by: friendId,
					updated_by: userId,
					meta: Meta,
				},
				{
					user_id: friendId,
					friend_id: userId,
					status: common.CONNECTIONS_STATUS.ACCEPTED,
					title: Title,
					agenda: Agenda,
					start_date: startDate,
					end_date: endDate,
					session_id: sessionId,
					created_by: friendId,
					updated_by: userId,
					meta: Meta,
				},
			]

			const requests = await requestSession.bulkCreate(SessionRequestData, {
				transaction: t,
			})

			return requests
		})

		return requests
	} catch (error) {
		throw error
	}
}

exports.rejectRequest = async (userId, friendId, rejectReason) => {
	try {
		let updateData = {
			status: common.CONNECTIONS_STATUS.REJECTED,
			updated_by: userId,
			deleted_at: Date.now(),
		}

		if (rejectReason) {
			updateData.meta = { reason: rejectReason }
		}

		return await requestSession.update(updateData, {
			where: {
				status: common.CONNECTIONS_STATUS.REQUESTED,
				[Op.or]: [
					{ user_id: userId, friend_id: friendId },
					{ user_id: friendId, friend_id: userId },
				],
				created_by: friendId,
			},
			individualHooks: true,
		})
	} catch (error) {
		throw error
	}
}
exports.findOneRequest = async (userId, friendId) => {
	try {
		const sessionRequest = await requestSession.findOne({
			where: {
				[Op.or]: [
					{ user_id: userId, friend_id: friendId },
					{ user_id: friendId, friend_id: userId },
				],
				status: common.CONNECTIONS_STATUS.REQUESTED,
				created_by: friendId,
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

exports.pendingRequestDetails = async (userId, friendId, startDate, endDate) => {
	try {
		const whereClause = {
			user_id: userId,
			friend_id: friendId,
			status: common.CONNECTIONS_STATUS.REQUESTED,
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

exports.getSentAndReceivedRequests = async (userId) => {
	try {
		const result = await requestSession.findAll({
			where: {
				[Op.or]: [{ user_id: userId }, { friend_id: userId }],
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
			raw: true,
		})
		return result
	} catch (error) {
		throw error
	}
}

exports.getRequestSessions = async (userId, friendId, startDate, endDate) => {
	try {
		const whereClause = {
			user_id: userId,
			friend_id: friendId,
			status: {
				[Op.or]: [common.CONNECTIONS_STATUS.ACCEPTED, common.CONNECTIONS_STATUS.BLOCKED],
			},
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

exports.getSessionRequestByUserIds = async (userId, friendIds, projection) => {
	try {
		const defaultProjection = ['user_id', 'friend_id']

		const result = await requestSession.findAll({
			where: {
				user_id: userId,
				friend_id: {
					[Op.in]: friendIds,
				},
				status: common.CONNECTIONS_STATUS.ACCEPTED,
			},
			attributes: projection || defaultProjection,
			raw: true,
		})
		return result
	} catch (error) {
		throw error
	}
}

exports.getConnectionsDetails = async (
	page,
	limit,
	filter,
	searchText = '',
	userId,
	organizationIds = [],
	roles = []
) => {
	try {
		let additionalFilter = ''
		let orgFilter = ''
		let filterClause = ''
		let rolesFilter = ''

		if (searchText) {
			additionalFilter = `AND name ILIKE :search`
		}

		if (organizationIds.length > 0) {
			orgFilter = `AND organization_id IN (:organizationIds)`
		}

		if (filter?.query?.length > 0) {
			filterClause = filter.query.startsWith('AND') ? filter.query : 'AND ' + filter.query
		}

		// Add the roles filter
		if (roles.includes('mentor') && roles.includes('mentee')) {
			// Show both mentors and mentees, no additional filter needed
		} else if (roles.includes('mentor')) {
			rolesFilter = `AND is_mentor = true`
		} else if (roles.includes('mentee')) {
			rolesFilter = `AND is_mentor = false`
		}

		const userFilterClause = `mv.user_id IN (SELECT friend_id FROM ${Connection.tableName} WHERE user_id = :userId)`

		const projectionClause = `
		mv.name,
		mv.user_id,
		mv.mentee_visibility,
		mv.organization_id,
		mv.designation,
		mv.experience,
		mv.is_mentor,
		mv.area_of_expertise,
		mv.education_qualification,
		mv.image,
		mv.custom_entity_text::JSONB AS custom_entity_text,
		mv.meta::JSONB AS user_meta,
		c.meta::JSONB AS connection_meta
		`

		let query = `
            SELECT ${projectionClause}
            FROM ${common.materializedViewsPrefix + MenteeExtension.tableName} mv
            LEFT JOIN ${Connection.tableName} c 
            ON c.friend_id = mv.user_id AND c.user_id = :userId
            WHERE ${userFilterClause}
            ${orgFilter}
            ${filterClause}
            ${rolesFilter}
            ${additionalFilter}
        `

		const replacements = {
			...filter?.replacements,
			search: `%${searchText}%`,
			userId,
			organizationIds,
		}

		if (page !== null && limit !== null) {
			query += `
                OFFSET :offset
                LIMIT :limit;
            `
			replacements.offset = limit * (page - 1)
			replacements.limit = limit
		}

		const connectedUsers = await sequelize.query(query, {
			type: QueryTypes.SELECT,
			replacements: replacements,
		})

		const countQuery = `
		    SELECT count(*) AS "count"
		    FROM ${common.materializedViewsPrefix + MenteeExtension.tableName} mv
		    LEFT JOIN ${Connection.tableName} c 
		    ON c.friend_id = mv.user_id AND c.user_id = :userId
		    WHERE ${userFilterClause}
		    ${filterClause}
		    ${rolesFilter}
		    ${orgFilter}
		    ${additionalFilter};
		`
		const count = await sequelize.query(countQuery, {
			type: QueryTypes.SELECT,
			replacements: replacements,
		})

		return {
			data: connectedUsers,
			count: Number(count[0].count),
		}
	} catch (error) {
		throw error
	}
}

exports.updateRequestSession = async (userId, friendId, updateBody) => {
	try {
		const [rowsUpdated, updatedConnections] = await Connection.update(updateBody, {
			where: {
				[Op.or]: [
					{ user_id: userId, friend_id: friendId },
					{ user_id: friendId, friend_id: userId },
				],
				status: common.CONNECTIONS_STATUS.ACCEPTED,
			},
			returning: true,
			raw: true,
		})

		// Find and return the specific row
		const targetConnection = updatedConnections.find(
			(connection) => connection.user_id === userId && connection.friend_id === friendId
		)

		return targetConnection
	} catch (error) {
		throw error
	}
}
