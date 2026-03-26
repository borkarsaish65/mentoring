const getIndexQueries = (tenantCode) => [
	{
		modelName: 'Session',
		queries: [
			`CREATE INDEX IF NOT EXISTS ${tenantCode}_idx_filtered_sessions ON ${tenantCode}_m_sessions (mentor_organization_id, status, type, mentor_id);`,
		],
	},
	{
		modelName: 'UserExtension',
		queries: [
			`CREATE INDEX IF NOT EXISTS ${tenantCode}_idx_user_ext_org_name ON ${tenantCode}_m_user_extensions (organization_id, lower(name)) WHERE is_mentor = true;`,
		],
	},
]

module.exports = getIndexQueries
