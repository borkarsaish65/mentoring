'use strict'
const Connection = require('../models/index').Connection
const ConnectionRequest = require('../models/index').ConnectionRequest

const { Op } = require('sequelize')
const sequelize = require('@database/models/index').sequelize

const common = require('@constants/common')
const MenteeExtension = require('@database/models/index').UserExtension
const { QueryTypes } = require('sequelize')
const { fn, col } = require('sequelize')

exports.addFriendRequest = async (userId, friendId, message) => {
	try {
		const result = await sequelize.transaction(async (t) => {
			const friendRequestData = [
				{
					user_id: userId,
					friend_id: friendId,
					status: common.CONNECTIONS_STATUS.REQUESTED,
					created_by: userId,
					updated_by: userId,
					meta: {
						message,
					},
				},
				{
					user_id: friendId,
					friend_id: userId,
					status: common.CONNECTIONS_STATUS.REQUESTED,
					created_by: userId,
					updated_by: userId,
					meta: {
						message,
					},
				},
			]

			const requests = await ConnectionRequest.bulkCreate(friendRequestData, { transaction: t })

			return requests[0].get({ plain: true })
		})

		return result
	} catch (error) {
		throw error
	}
}

exports.getPendingRequests = async (userId, page, pageSize) => {
	try {
		// This will retrieve send and received request

		const result = await ConnectionRequest.findAndCountAll({
			where: {
				user_id: userId,
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
			raw: true,
			limit: pageSize,
			offset: (page - 1) * pageSize,
			order: [['created_at', 'DESC']],
		})
		return result
	} catch (error) {
		throw error
	}
}

exports.getRejectedRequest = async (userId, friendId) => {
	try {
		const result = await ConnectionRequest.findOne({
			where: {
				user_id: userId,
				friend_id: friendId,
				status: common.CONNECTIONS_STATUS.REJECTED,
				created_by: friendId,
			},
			paranoid: false,
			order: [['deleted_at', 'DESC']], // Order by the deleted_at field in descending order to get the latest
			raw: true,
		})
		return result
	} catch (error) {
		console.log(error)
		throw error
	}
}

exports.approveRequest = async (userId, friendId, meta) => {
	try {
		const requests = await sequelize.transaction(async (t) => {
			const deletedCount = await ConnectionRequest.destroy({
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
				throw new Error('Error while deleting from "ConnectionRequest"')
			}

			const friendRequestData = [
				{
					user_id: userId,
					friend_id: friendId,
					status: common.CONNECTIONS_STATUS.ACCEPTED,
					created_by: friendId,
					updated_by: userId,
					meta,
				},
				{
					user_id: friendId,
					friend_id: userId,
					status: common.CONNECTIONS_STATUS.ACCEPTED,
					created_by: friendId,
					updated_by: userId,
					meta,
				},
			]

			const requests = await Connection.bulkCreate(friendRequestData, {
				transaction: t,
			})

			return requests
		})

		return requests
	} catch (error) {
		throw error
	}
}

exports.rejectRequest = async (userId, friendId) => {
	try {
		const updateData = {
			status: common.CONNECTIONS_STATUS.REJECTED,
			updated_by: userId,
			deleted_at: Date.now(),
		}

		return await ConnectionRequest.update(updateData, {
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
		const connectionRequest = await ConnectionRequest.findOne({
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

		return connectionRequest
	} catch (error) {
		throw error
	}
}

exports.checkPendingRequest = async (userId, friendId) => {
	try {
		const result = await ConnectionRequest.findOne({
			where: {
				user_id: userId,
				friend_id: friendId,
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
			raw: true,
		})
		return result
	} catch (error) {
		throw error
	}
}

exports.deleteUserConnectionsAndRequests = async (userId) => {
	try {
		const now = new Date()

		const modelsToUpdate = [
			{ model: ConnectionRequest, status: common.CONNECTIONS_STATUS.REQUESTED },
			{ model: Connection, status: common.CONNECTIONS_STATUS.ACCEPTED },
		]

		let deleted = false

		for (const { model, status } of modelsToUpdate) {
			const [affectedRows] = await model.update(
				{ deleted_at: now },
				{
					where: {
						[Op.or]: [{ user_id: userId }, { friend_id: userId }],
						status,
					},
				}
			)

			if (affectedRows > 0) {
				deleted = true
			}
		}

		return deleted
	} catch (error) {
		throw error
	}
}

exports.getConnection = async (userId, friendId) => {
	try {
		const result = await Connection.findOne({
			where: {
				user_id: userId,
				friend_id: friendId,
				status: {
					[Op.or]: [common.CONNECTIONS_STATUS.ACCEPTED, common.CONNECTIONS_STATUS.BLOCKED],
				},
			},
			raw: true,
		})
		return result
	} catch (error) {
		throw error
	}
}

exports.getConnectionsByUserIds = async (userId, friendIds, projection) => {
	try {
		const defaultProjection = ['user_id', 'friend_id']

		const result = await Connection.findAll({
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

		const userFilterClause = `c.deleted_at IS NULL and mv.user_id IN (SELECT friend_id FROM ${Connection.tableName} WHERE user_id = :userId)`

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
		c.meta::JSONB AS connection_meta,
		mv.deleted_at AS user_deleted_at,
		c.deleted_at AS connections_deleted_at
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

exports.updateConnection = async (userId, friendId, updateBody) => {
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

exports.getConnectionsCount = async (filter, userId, organizationIds = []) => {
	try {
		let orgFilter = ''
		let filterClause = ''

		if (organizationIds.length > 0) {
			orgFilter = `AND ue.organization_id IN (:organizationIds)`
		}

		if (filter?.query?.length > 0) {
			filterClause = filter.query.startsWith('AND') ? filter.query : 'AND ' + filter.query
		}

		const userFilterClause = `ue.user_id IN (SELECT friend_id FROM ${Connection.tableName} WHERE user_id = :userId)`

		const countQuery = `
			SELECT COUNT(*) AS count
			FROM ${MenteeExtension.tableName} ue
			LEFT JOIN ${Connection.tableName} c 
			ON c.friend_id = ue.user_id AND c.user_id = :userId
			WHERE ${userFilterClause}
			${orgFilter}
			${filterClause};
		`

		const replacements = {
			...filter?.replacements,
			userId,
			organizationIds,
		}

		const result = await sequelize.query(countQuery, {
			type: QueryTypes.SELECT,
			replacements,
		})

		return Number(result[0].count)
	} catch (error) {
		throw error
	}
}

exports.getConnectedUsers = async (userId, selectColumn = 'user_id', whereColumn = 'friend_id') => {
	try {
		const allowed = new Set(['user_id', 'friend_id'])
		if (!allowed.has(selectColumn) || !allowed.has(whereColumn)) {
			throw new Error('Invalid column name')
		}

		const connections = await Connection.findAll({
			attributes: [[fn('DISTINCT', col(selectColumn)), 'user_id']],
			where: {
				[whereColumn]: userId,
				status: common.CONNECTIONS_STATUS.ACCEPTED,
			},
			raw: true,
		})

		const userIds = connections.map((conn) => conn.user_id)

		return userIds.length > 0 ? userIds : []
	} catch (error) {
		throw error
	}
}

exports.getRequestsCount = async (userId) => {
	try {
		// This will retrieve the request count
		const result = await ConnectionRequest.count({
			where: {
				friend_id: userId,
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
		})
		return result
	} catch (error) {
		throw error
	}
}

exports.deleteConnections = async (userId, friend_id) => {
	try {
		const now = new Date()

		const modelsToUpdate = [{ model: Connection, status: common.CONNECTIONS_STATUS.ACCEPTED }]

		let deleted = false

		for (const { model, status } of modelsToUpdate) {
			const [affectedRows] = await model.update(
				{ deleted_at: now },
				{
					where: {
						[Op.and]: [{ user_id: userId }, { friend_id: friend_id }],
						status,
					},
				}
			)

			if (affectedRows > 0) {
				deleted = true
			}
		}

		return deleted
	} catch (error) {
		throw error
	}
}
exports.deleteConnectionsRequests = async (userId, friend_id) => {
	try {
		const now = new Date()

		const modelsToUpdate = [{ model: ConnectionRequest, status: common.CONNECTIONS_STATUS.REQUESTED }]

		let deleted = false

		for (const { model, status } of modelsToUpdate) {
			const [affectedRows] = await model.update(
				{ deleted_at: now },
				{
					where: {
						[Op.and]: [{ user_id: userId }, { friend_id: friend_id }],
						status,
					},
				}
			)

			if (affectedRows > 0) {
				deleted = true
			}
		}

		return deleted
	} catch (error) {
		throw error
	}
}

exports.getConnectionRequestsForUser = async (userId) => {
	try {
		// This will retrieve send and received request

		const result = await ConnectionRequest.findAndCountAll({
			where: {
				user_id: userId,
				status: common.CONNECTIONS_STATUS.REQUESTED,
			},
			raw: true,
		})
		return result
	} catch (error) {
		throw error
	}
}
