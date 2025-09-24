/**
 * name : configs/kafka
 * author : Aman Gupta
 * Date : 07-Dec-2021
 * Description : Kafka connection configurations
 */

const utils = require('@generics/utils')
const { elevateLog } = require('elevate-logger')
const logger = elevateLog.init()
const { Kafka } = require('kafkajs')
const userRequest = require('@services/users')
const adminService = require('@services/admin')
const orgService = require('@services/org-admin')

module.exports = async () => {
	const kafkaIps = process.env.KAFKA_URL.split(',')
	const KafkaClient = new Kafka({
		clientId: 'mentoring',
		brokers: kafkaIps,
	})

	const producer = KafkaClient.producer()
	const consumer = KafkaClient.consumer({ groupId: process.env.KAFKA_INTERNAL_CACHE_GROUP_ID })
	const eventConsumer = KafkaClient.consumer({ groupId: process.env.EVENTS_GROUP_ID })

	await producer.connect()
	await consumer.connect()
	await eventConsumer.connect()

	producer.on('producer.connect', () => {
		logger.info('KafkaProvider: connected')
	})
	producer.on('producer.disconnect', () => {
		logger.error('KafkaProvider: could not connect', {
			triggerNotification: true,
		})
	})

	const subscribeToConsumer = async () => {
		await consumer.subscribe({ topics: [process.env.CLEAR_INTERNAL_CACHE] })
		await eventConsumer.subscribe({ topics: [process.env.EVENTS_TOPIC] })

		const cache = consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				try {
					let streamingData = JSON.parse(message.value)
					if (streamingData.type == 'CLEAR_INTERNAL_CACHE') {
						utils.internalDel(streamingData.value)
					}
				} catch (error) {
					throw error
				}
			},
		})
		const events = eventConsumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				try {
					const rawValue = message.value?.toString()
					if (!rawValue || rawValue.trim() === '') {
						logger.warn(`Empty Kafka message skipped on topic ${topic}`)
						return
					}

					let streamingData
					try {
						streamingData = JSON.parse(rawValue)
					} catch (e) {
						logger.error('Invalid JSON in Kafka message', {
							topic,
							partition,
							offset: message?.offset,
							err: e?.message,
						})
						return
					}

					if (streamingData.eventType) {
						if (streamingData.eventType == 'create' || streamingData.eventType == 'bulk-create') {
							const org = streamingData.organizations?.[0]
							if (!org) {
								logger.warn(`Create event missing organizations[0]; skipping`, {
									topic,
									partition,
									offset: message?.offset,
								})
								return
							}
							streamingData.organization_id = org.id
							streamingData.user_roles = (org.roles || []).map((role) => ({ title: role.title }))
							await userRequest.add(streamingData)
						} else if (streamingData.eventType == 'delete') {
							const deleteId = streamingData.entityId || streamingData.id
							if (!deleteId) {
								logger.warn(`Delete event missing id/entityId; skipping`, {
									topic,
									partition,
									offset: message?.offset,
								})
								return
							}
							await adminService.userDelete(deleteId.toString())
						} else if (streamingData.eventType == 'update' || streamingData.eventType == 'bulk-update') {
							const { oldValues, newValues, entityId } = streamingData
							streamingData.userId = entityId.toString()

							// Trigger on any role difference (add/remove/change)
							const oldRoles = oldValues?.organizations?.[0]?.roles || []
							const newRoles = newValues?.organizations?.[0]?.roles || []
							const toTitles = (roles) => (roles || []).map((r) => r?.title).filter(Boolean)
							const oldSet = new Set(toTitles(oldRoles))
							const newSet = new Set(toTitles(newRoles))
							const rolesDiffer =
								oldSet.size !== newSet.size ||
								[...oldSet].some((t) => !newSet.has(t)) ||
								[...newSet].some((t) => !oldSet.has(t))

							if (rolesDiffer) {
								const bodyData = {
									user_id: entityId.toString(),
									current_roles: oldRoles,
									new_roles: newRoles,
								}
								const updateData = {
									updated_by: entityId,
									updated_at: new Date(),
								}
								await orgService.roleChange(bodyData, updateData)
							}
						}
					}
				} catch (error) {
					console.log('----------', error)
					logger.error('Error in eventConsumer.eachMessage', {
						topic,
						partition,
						offset: message?.offset,
						err: error?.stack || error?.message || String(error),
					})
				}
			},
		})
		await Promise.allSettled([cache, events])
	}
	subscribeToConsumer()

	global.kafkaProducer = producer
	global.kafkaClient = KafkaClient
}
