'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		try {
			// Get all existing tenants
			const [tenants] = await queryInterface.sequelize.query(`SELECT code FROM tenants WHERE deleted_at IS NULL`)

			// Get all existing materialized views
			const [matviews] = await queryInterface.sequelize.query(`SELECT matviewname FROM pg_matviews`)
			const existingViews = matviews.map((v) => v.matviewname.toLowerCase())

			for (const tenant of tenants) {
				const tenantCode = tenant.code

				// Create indexes on sessions view if it exists
				const sessionsView = `${tenantCode}_m_sessions`
				if (existingViews.includes(sessionsView.toLowerCase())) {
					await queryInterface.sequelize.query(
						`CREATE INDEX IF NOT EXISTS ${tenantCode}_idx_filtered_sessions ON ${sessionsView} (mentor_organization_id, status, type, mentor_id);`
					)
					await queryInterface.sequelize.query(
						`CREATE INDEX IF NOT EXISTS ${tenantCode}_idx_sessions_mentor_status_date ON ${sessionsView} (mentor_id, status, start_date);`
					)
					await queryInterface.sequelize.query(
						`CREATE INDEX IF NOT EXISTS ${tenantCode}_idx_sessions_status_type_date ON ${sessionsView} (status, type, start_date);`
					)
				}

				// Create indexes on user extensions view if it exists
				const userExtView = `${tenantCode}_m_user_extensions`
				if (existingViews.includes(userExtView.toLowerCase())) {
					await queryInterface.sequelize.query(
						`CREATE INDEX IF NOT EXISTS ${tenantCode}_idx_user_ext_org_name ON ${userExtView} (organization_id, lower(name)) WHERE is_mentor = true;`
					)
					await queryInterface.sequelize.query(
						`CREATE INDEX IF NOT EXISTS ${tenantCode}_idx_user_ext_email ON ${userExtView} (email);`
					)
					await queryInterface.sequelize.query(
						`CREATE INDEX IF NOT EXISTS ${tenantCode}_idx_user_ext_org_code ON ${userExtView} (organization_code);`
					)
				}
			}
		} catch (error) {
			console.error('Migration up failed:', error)
			throw error
		}
	},

	down: async (queryInterface, Sequelize) => {
		try {
			const [tenants] = await queryInterface.sequelize.query(`SELECT code FROM tenants WHERE deleted_at IS NULL`)

			for (const tenant of tenants) {
				const tenantCode = tenant.code

				await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${tenantCode}_idx_filtered_sessions;`)
				await queryInterface.sequelize.query(
					`DROP INDEX IF EXISTS ${tenantCode}_idx_sessions_mentor_status_date;`
				)
				await queryInterface.sequelize.query(
					`DROP INDEX IF EXISTS ${tenantCode}_idx_sessions_status_type_date;`
				)
				await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${tenantCode}_idx_user_ext_org_name;`)
				await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${tenantCode}_idx_user_ext_email;`)
				await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${tenantCode}_idx_user_ext_org_code;`)
			}
		} catch (error) {
			console.error('Migration down failed:', error)
			throw error
		}
	},
}
