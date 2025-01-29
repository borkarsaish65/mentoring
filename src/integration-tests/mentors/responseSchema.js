const reportsSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'object',
			properties: {
				totalSessionCreated: {
					type: 'integer',
				},
				totalsessionHosted: {
					type: 'integer',
				},
			},
			required: ['totalSessionCreated', 'totalsessionHosted'],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: [
						{
							type: 'object',
						},
					],
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const profileSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'object',
			properties: {
				sessions_attended: {
					type: 'integer',
				},
				sessions_hosted: {
					type: 'integer',
				},
				id: {
					type: 'string',
				},
				email: {
					type: 'string',
				},
				email_verified: {
					type: 'string',
				},
				name: {
					type: 'string',
				},
				location: {
					type: 'null',
				},
				about: {
					type: 'null',
				},
				share_link: {
					type: 'null',
				},
				status: {
					type: 'string',
				},
				image: {
					type: 'null',
				},
				has_accepted_terms_and_conditions: {
					type: 'boolean',
				},
				languages: {
					type: 'null',
				},
				preferred_language: {
					type: 'object',
					properties: {
						value: {
							type: 'string',
						},
						label: {
							type: 'string',
						},
					},
					required: ['value', 'label'],
				},
				organization_id: {
					type: 'string',
				},
				roles: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
						{
							type: 'string',
						},
						{
							type: 'string',
						},
						{
							type: 'string',
						},
						{
							type: 'string',
						},
					],
				},
				meta: {
					type: 'null',
				},
				deleted_at: {
					type: 'null',
				},
				organization: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
						},
						name: {
							type: 'string',
						},
						code: {
							type: 'string',
						},
					},
					required: ['id', 'name', 'code'],
				},
				user_roles: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								title: {
									type: 'string',
								},
								label: {
									type: 'string',
								},
								user_type: {
									type: 'integer',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'string',
								},
								visibility: {
									type: 'string',
								},
							},
							required: ['id', 'title', 'label', 'user_type', 'status', 'organization_id', 'visibility'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								title: {
									type: 'string',
								},
								label: {
									type: 'null',
								},
								user_type: {
									type: 'integer',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'string',
								},
								visibility: {
									type: 'string',
								},
							},
							required: ['id', 'title', 'label', 'user_type', 'status', 'organization_id', 'visibility'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								title: {
									type: 'string',
								},
								label: {
									type: 'null',
								},
								user_type: {
									type: 'integer',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'string',
								},
								visibility: {
									type: 'string',
								},
							},
							required: ['id', 'title', 'label', 'user_type', 'status', 'organization_id', 'visibility'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								title: {
									type: 'string',
								},
								label: {
									type: 'null',
								},
								user_type: {
									type: 'integer',
								},
								status: {
									type: 'string',
								},
								organization_id: {
									type: 'string',
								},
								visibility: {
									type: 'string',
								},
							},
							required: ['id', 'title', 'label', 'user_type', 'status', 'organization_id', 'visibility'],
						},
					],
				},
				permissions: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
						{
							type: 'object',
							properties: {
								module: {
									type: 'string',
								},
								request_type: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								service: {
									type: 'string',
								},
							},
							required: ['module', 'request_type', 'service'],
						},
					],
				},
				profile_mandatory_fields: {
					type: 'array',
					items: {},
				},
				designation: {
					type: 'null',
				},
				area_of_expertise: {
					type: 'null',
				},
				education_qualification: {
					type: 'null',
				},
				rating: {
					type: 'null',
				},
				stats: {
					type: 'null',
				},
				tags: {
					type: 'null',
				},
				configs: {
					type: 'null',
				},
				external_session_visibility: {
					type: 'string',
				},
				experience: {
					type: 'null',
				},
				external_mentee_visibility: {
					type: 'string',
				},
				mentee_visibility: {
					type: 'string',
				},
				external_mentor_visibility: {
					type: 'string',
				},
				mentor_visibility: {
					type: 'string',
				},
				phone: {
					type: 'null',
				},
				is_mentor: {
					type: 'boolean',
				},
				created_at: {
					type: 'string',
				},
				updated_at: {
					type: 'string',
				},
			},
			required: [
				'sessions_attended',
				'sessions_hosted',
				'id',
				'email',
				'email_verified',
				'name',
				'location',
				'about',
				'share_link',
				'status',
				'image',
				'has_accepted_terms_and_conditions',
				'languages',
				'preferred_language',
				'organization_id',
				'roles',
				'meta',
				'deleted_at',
				'organization',
				'user_roles',
				'permissions',
				'profile_mandatory_fields',
				'designation',
				'area_of_expertise',
				'education_qualification',
				'rating',
				'stats',
				'tags',
				'configs',
				'external_session_visibility',
				'experience',
				'external_mentee_visibility',
				'mentee_visibility',
				'external_mentor_visibility',
				'mentor_visibility',
				'phone',
				'is_mentor',
				'created_at',
				'updated_at',
			],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
					],
				},
				correlation: {
					type: 'string',
				},
				meetingPlatform: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation', 'meetingPlatform'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const upcomingSessionsSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: {},
				},
				count: {
					type: 'integer',
				},
			},
			required: ['data', 'count'],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
					],
				},
				correlation: {
					type: 'string',
				},
				meetingPlatform: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation', 'meetingPlatform'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const shareSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'object',
			properties: {
				shareLink: {
					type: 'string',
				},
			},
			required: ['shareLink'],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: [
						{
							type: 'object',
						},
					],
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const mentorsList = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								email: {
									type: 'string',
								},
								email_verified: {
									type: 'string',
								},
								name: {
									type: 'string',
								},
								location: {
									type: 'null',
								},
								about: {
									type: 'null',
								},
								share_link: {
									type: 'null',
								},
								status: {
									type: 'string',
								},
								image: {
									type: 'null',
								},
								has_accepted_terms_and_conditions: {
									type: 'boolean',
								},
								languages: {
									type: 'null',
								},
								preferred_language: {
									type: 'object',
									properties: {
										value: {
											type: 'string',
										},
										label: {
											type: 'string',
										},
									},
									required: ['value', 'label'],
								},
								roles: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								created_at: {
									type: 'string',
								},
								updated_at: {
									type: 'string',
								},
								deleted_at: {
									type: 'null',
								},
								organization: {
									type: 'object',
									properties: {
										id: {
											type: 'string',
										},
										name: {
											type: 'string',
										},
										code: {
											type: 'string',
										},
									},
									required: ['id', 'name', 'code'],
								},
								user_roles: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
									],
								},
								permissions: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
									],
								},
								rating: {
									type: 'null',
								},
								designation: {
									type: 'null',
								},
								area_of_expertise: {
									type: 'null',
								},
								education_qualification: {
									type: 'null',
								},
							},
							required: [
								'id',
								'email',
								'email_verified',
								'name',
								'location',
								'about',
								'share_link',
								'status',
								'image',
								'has_accepted_terms_and_conditions',
								'languages',
								'preferred_language',
								'roles',
								'created_at',
								'updated_at',
								'deleted_at',
								'organization',
								'user_roles',
								'permissions',
								'rating',
								'designation',
								'area_of_expertise',
								'education_qualification',
							],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								email: {
									type: 'string',
								},
								email_verified: {
									type: 'string',
								},
								name: {
									type: 'string',
								},
								location: {
									type: 'null',
								},
								about: {
									type: 'null',
								},
								share_link: {
									type: 'null',
								},
								status: {
									type: 'string',
								},
								image: {
									type: 'null',
								},
								has_accepted_terms_and_conditions: {
									type: 'boolean',
								},
								languages: {
									type: 'null',
								},
								preferred_language: {
									type: 'object',
									properties: {
										value: {
											type: 'string',
										},
										label: {
											type: 'string',
										},
									},
									required: ['value', 'label'],
								},
								roles: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								created_at: {
									type: 'string',
								},
								updated_at: {
									type: 'string',
								},
								deleted_at: {
									type: 'null',
								},
								organization: {
									type: 'object',
									properties: {
										id: {
											type: 'string',
										},
										name: {
											type: 'string',
										},
										code: {
											type: 'string',
										},
									},
									required: ['id', 'name', 'code'],
								},
								user_roles: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
									],
								},
								permissions: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
									],
								},
								rating: {
									type: 'null',
								},
								designation: {
									type: 'null',
								},
								area_of_expertise: {
									type: 'null',
								},
								education_qualification: {
									type: 'null',
								},
							},
							required: [
								'id',
								'email',
								'email_verified',
								'name',
								'location',
								'about',
								'share_link',
								'status',
								'image',
								'has_accepted_terms_and_conditions',
								'languages',
								'preferred_language',
								'roles',
								'created_at',
								'updated_at',
								'deleted_at',
								'organization',
								'user_roles',
								'permissions',
								'rating',
								'designation',
								'area_of_expertise',
								'education_qualification',
							],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								email: {
									type: 'string',
								},
								email_verified: {
									type: 'string',
								},
								name: {
									type: 'string',
								},
								location: {
									type: 'null',
								},
								about: {
									type: 'null',
								},
								share_link: {
									type: 'null',
								},
								status: {
									type: 'string',
								},
								image: {
									type: 'null',
								},
								has_accepted_terms_and_conditions: {
									type: 'boolean',
								},
								languages: {
									type: 'null',
								},
								preferred_language: {
									type: 'object',
									properties: {
										value: {
											type: 'string',
										},
										label: {
											type: 'string',
										},
									},
									required: ['value', 'label'],
								},
								roles: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								created_at: {
									type: 'string',
								},
								updated_at: {
									type: 'string',
								},
								deleted_at: {
									type: 'null',
								},
								organization: {
									type: 'object',
									properties: {
										id: {
											type: 'string',
										},
										name: {
											type: 'string',
										},
										code: {
											type: 'string',
										},
									},
									required: ['id', 'name', 'code'],
								},
								user_roles: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
									],
								},
								permissions: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
									],
								},
								rating: {
									type: 'null',
								},
								designation: {
									type: 'null',
								},
								area_of_expertise: {
									type: 'null',
								},
								education_qualification: {
									type: 'null',
								},
							},
							required: [
								'id',
								'email',
								'email_verified',
								'name',
								'location',
								'about',
								'share_link',
								'status',
								'image',
								'has_accepted_terms_and_conditions',
								'languages',
								'preferred_language',
								'roles',
								'created_at',
								'updated_at',
								'deleted_at',
								'organization',
								'user_roles',
								'permissions',
								'rating',
								'designation',
								'area_of_expertise',
								'education_qualification',
							],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								email: {
									type: 'string',
								},
								email_verified: {
									type: 'string',
								},
								name: {
									type: 'string',
								},
								location: {
									type: 'null',
								},
								about: {
									type: 'null',
								},
								share_link: {
									type: 'null',
								},
								status: {
									type: 'string',
								},
								image: {
									type: 'null',
								},
								has_accepted_terms_and_conditions: {
									type: 'boolean',
								},
								languages: {
									type: 'null',
								},
								preferred_language: {
									type: 'object',
									properties: {
										value: {
											type: 'string',
										},
										label: {
											type: 'string',
										},
									},
									required: ['value', 'label'],
								},
								roles: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								created_at: {
									type: 'string',
								},
								updated_at: {
									type: 'string',
								},
								deleted_at: {
									type: 'null',
								},
								organization: {
									type: 'object',
									properties: {
										id: {
											type: 'string',
										},
										name: {
											type: 'string',
										},
										code: {
											type: 'string',
										},
									},
									required: ['id', 'name', 'code'],
								},
								user_roles: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
									],
								},
								permissions: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
									],
								},
								rating: {
									type: 'null',
								},
								designation: {
									type: 'null',
								},
								area_of_expertise: {
									type: 'null',
								},
								education_qualification: {
									type: 'null',
								},
							},
							required: [
								'id',
								'email',
								'email_verified',
								'name',
								'location',
								'about',
								'share_link',
								'status',
								'image',
								'has_accepted_terms_and_conditions',
								'languages',
								'preferred_language',
								'roles',
								'created_at',
								'updated_at',
								'deleted_at',
								'organization',
								'user_roles',
								'permissions',
								'rating',
								'designation',
								'area_of_expertise',
								'education_qualification',
							],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'string',
								},
								email: {
									type: 'string',
								},
								email_verified: {
									type: 'string',
								},
								name: {
									type: 'string',
								},
								location: {
									type: 'null',
								},
								about: {
									type: 'null',
								},
								share_link: {
									type: 'null',
								},
								status: {
									type: 'string',
								},
								image: {
									type: 'null',
								},
								has_accepted_terms_and_conditions: {
									type: 'boolean',
								},
								languages: {
									type: 'null',
								},
								preferred_language: {
									type: 'object',
									properties: {
										value: {
											type: 'string',
										},
										label: {
											type: 'string',
										},
									},
									required: ['value', 'label'],
								},
								roles: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
										{
											type: 'string',
										},
									],
								},
								created_at: {
									type: 'string',
								},
								updated_at: {
									type: 'string',
								},
								deleted_at: {
									type: 'null',
								},
								organization: {
									type: 'object',
									properties: {
										id: {
											type: 'string',
										},
										name: {
											type: 'string',
										},
										code: {
											type: 'string',
										},
									},
									required: ['id', 'name', 'code'],
								},
								user_roles: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
										{
											type: 'object',
											properties: {
												id: {
													type: 'string',
												},
												title: {
													type: 'string',
												},
												label: {
													type: 'null',
												},
												user_type: {
													type: 'integer',
												},
												status: {
													type: 'string',
												},
												organization_id: {
													type: 'string',
												},
												visibility: {
													type: 'string',
												},
											},
											required: [
												'id',
												'title',
												'label',
												'user_type',
												'status',
												'organization_id',
												'visibility',
											],
										},
									],
								},
								permissions: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
										{
											type: 'object',
											properties: {
												module: {
													type: 'string',
												},
												request_type: {
													type: 'array',
													items: [
														{
															type: 'string',
														},
														{
															type: 'string',
														},
													],
												},
												service: {
													type: 'string',
												},
											},
											required: ['module', 'request_type', 'service'],
										},
									],
								},
								rating: {
									type: 'null',
								},
								designation: {
									type: 'null',
								},
								area_of_expertise: {
									type: 'null',
								},
								education_qualification: {
									type: 'null',
								},
							},
							required: [
								'id',
								'email',
								'email_verified',
								'name',
								'location',
								'about',
								'share_link',
								'status',
								'image',
								'has_accepted_terms_and_conditions',
								'languages',
								'preferred_language',
								'roles',
								'created_at',
								'updated_at',
								'deleted_at',
								'organization',
								'user_roles',
								'permissions',
								'rating',
								'designation',
								'area_of_expertise',
								'education_qualification',
							],
						},
					],
				},
				count: {
					type: 'integer',
				},
			},
			required: ['data', 'count'],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								type: {
									type: 'string',
								},
								version: {
									type: 'integer',
								},
							},
							required: ['id', 'type', 'version'],
						},
					],
				},
				correlation: {
					type: 'string',
				},
				meetingPlatform: {
					type: 'string',
				},
			},
			required: ['formsVersion', 'correlation', 'meetingPlatform'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

const createdSessionsSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'object',
			properties: {
				count: {
					type: 'integer',
				},
				data: {
					type: 'array',
					items: [
						{
							type: 'object',
							properties: {
								id: {
									type: 'integer',
								},
								title: {
									type: 'string',
								},
								mentor_id: {
									type: 'string',
								},
								description: {
									type: 'string',
								},
								status: {
									type: 'string',
								},
								start_date: {
									type: 'string',
								},
								end_date: {
									type: 'string',
								},
								image: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
									],
								},
								created_at: {
									type: 'string',
								},
								meeting_info: {
									type: 'object',
									properties: {
										value: {
											type: 'string',
										},
										platform: {
											type: 'string',
										},
									},
									required: ['value', 'platform'],
								},
								mentor_name: {
									type: 'string',
								},
								organization: {
									type: 'object',
									properties: {
										id: {
											type: 'integer',
										},
										name: {
											type: 'string',
										},
										code: {
											type: 'string',
										},
									},
									required: ['id', 'name', 'code'],
								},
							},
							required: [
								'id',
								'title',
								'mentor_id',
								'description',
								'status',
								'start_date',
								'end_date',
								'image',
								'created_at',
								'meeting_info',
								'mentor_name',
								'organization',
							],
						},
					],
				},
			},
			required: ['count', 'data'],
		},
		meta: {
			type: 'object',
			properties: {
				correlation: {
					type: 'string',
				},
				meetingPlatform: {
					type: 'string',
				},
			},
			required: ['correlation', 'meetingPlatform'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
module.exports = {
	reportsSchema,
	profileSchema,
	upcomingSessionsSchema,
	shareSchema,
	mentorsList,
	createdSessionsSchema,
}
