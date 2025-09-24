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

		await consumer.run({
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
		await eventConsumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				try {
					const rawValue = message.value.toString()
					if (!rawValue || rawValue.trim() === '') {
						console.warn(`Empty Kafka message skipped on topic ${topic}`)
						return
					}

					let streamingData = JSON.parse(rawValue)

					if (streamingData.eventType) {
						if (streamingData.eventType == 'create' || streamingData.eventType == 'bulk-create') {
							streamingData.organization_id = streamingData.organizations[0].id
							streamingData.user_roles = streamingData.organizations[0].roles.map((role) => {
								return {
									title: role.title,
								}
							})
							await userRequest.add(streamingData)
						} else if (streamingData.eventType == 'delete') {
							await adminService.userDelete(streamingData.id)
						} else if (streamingData.eventType == 'update' || streamingData.eventType == 'bulk-update') {
							const { oldValues, newValues, entityId } = streamingData
							streamingData.userId = entityId.toString()

							// Check if roles exist and have changed
							const oldRoles = oldValues?.organizations[0]?.roles || []
							const newRoles = newValues?.organizations[0]?.roles || []

							if (oldRoles.length > 0 && newRoles.length > 0) {
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
					throw error
				}
			},
		})
	}
	subscribeToConsumer()

	global.kafkaProducer = producer
	global.kafkaClient = KafkaClient
}
