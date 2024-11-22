'use strict'
require('module-alias/register')
require('dotenv').config({ path: '../../.env' })
const userRequests = require('@requests/user')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			const { STRING } = Sequelize

			await queryInterface.addColumn('user_extensions', 'image', { type: STRING, allowNull: true })

			const [userCount] = await queryInterface.sequelize.query(
				'SELECT count(*) AS "count" FROM user_extensions WHERE image IS NULL AND deleted_at IS NULL;'
			)

			console.log(`Number of users to update: ${userCount[0].count}`)

			const updateUsers = async (table, userIds, batchSize = 200) => {
				const updateBatch = async (batch) => {  

					
					const userDetails = (await userRequests.getListOfUserDetails(batch)).result
					
					const userDetailsMap = Object.fromEntries(userDetails.map((user) => [user.id, user]))

					const updates = batch.map(async (userId) => {
						const matchingUser = userDetailsMap[userId]
						if (matchingUser) {
							try {
								let imagePath
								if (matchingUser.image_cloud_path) {
									imagePath = matchingUser.image_cloud_path
								} else {
									imagePath = matchingUser.image
								}
								if(imagePath){
									await queryInterface.sequelize.query(
										`UPDATE ${table} SET image = ? WHERE user_id = ?`,
										{
											replacements: [imagePath, userId.toString()],
										}
									)
								}
							} catch (error) {
								console.error(`Error updating userId ${userId} in ${table}:`, error)
							}
						} else {
							console.warn(`No matching user found for userId: ${userId} in ${table}`)
						}
					})

					await Promise.all(updates)
				}

				// for (let i = 0; i < userIds.length; i += batchSize) {
					//const batch = userIds.slice(i, i + batchSize)
					await updateBatch(userIds)
				// }
			}

			if (userCount[0].count > 0) {
				const [users] = await queryInterface.sequelize.query(
					'SELECT user_id FROM user_extensions WHERE image IS NULL AND deleted_at IS NULL;'
				)

				let userIds = [] 
                                 users.map(function(user) {  if(user.user_id && Number(user.user_id)) { userIds.push(Number(user.user_id)) } });
				// Clean up userIds
				// userIds = userIds
				// 	.map((userId) => {
				// 		// Remove any extra spaces, quotes, or commas from the userId
				// 		const cleanedUserId = (userId || '').replace(/[\s',\n\r"]/g, '') .trim();
				// 		return cleanedUserId;
				// 	})
				// 	.filter((userId) => userId && !isNaN(userId)) // Filter out empty or invalid user_ids

				// Log any invalid userIds for debugging
				const invalidUserIds = userIds.filter((userId) => isNaN(userId));
				if (invalidUserIds.length > 0) {
					console.warn('Invalid userIds detected and filtered out:', invalidUserIds)
				}
				console.log("=====================",userIds);
				await updateUsers('user_extensions', userIds)
			}
		} catch (error) {
			console.error('Migration failed:', error)
			throw error
		}
	},

	down: async (queryInterface) => {
		try {
			await queryInterface.removeColumn('user_extensions', 'image')
		} catch (err) {
			console.error('Rollback failed:', err)
			throw err
		}
	},
}
