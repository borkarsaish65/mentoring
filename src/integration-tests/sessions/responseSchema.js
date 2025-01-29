const createSchema = {
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
				session_reschedule: {
					type: 'integer',
				},
				is_feedback_skipped: {
					type: 'boolean',
				},
				seats_remaining: {
					type: 'integer',
				},
				seats_limit: {
					type: 'integer',
				},
				type: {
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
				id: {
					type: 'integer',
				},
				title: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				start_date: {
					type: 'string',
				},
				end_date: {
					type: 'string',
				},
				recommended_for: {
					type: 'array',
					items: [
						{
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
					],
				},
				meeting_info: {
					type: 'object',
					properties: {
						link: {
							type: 'string',
						},
						value: {
							type: 'string',
						},
						platform: {
							type: 'string',
						},
					},
					required: ['link', 'value', 'platform'],
				},
				categories: {
					type: 'array',
					items: [
						{
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
					],
				},
				medium: {
					type: 'array',
					items: [
						{
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
					],
				},
				time_zone: {
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
				created_by: {
					type: 'string',
				},
				updated_by: {
					type: 'string',
				},
				mentor_id: {
					type: 'string',
				},
				mentor_name: {
					type: 'string',
				},
				status: {
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
				meta: {
					type: 'null',
				},
				mentor_organization_id: {
					type: 'string',
				},
				visibility: {
					type: 'string',
				},
				visible_to_organizations: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
					],
				},
				mentee_feedback_question_set: {
					type: 'string',
				},
				mentor_feedback_question_set: {
					type: 'string',
				},
				updated_at: {
					type: 'string',
				},
				created_at: {
					type: 'string',
				},
				mentee_password: {
					type: 'null',
				},
				mentor_password: {
					type: 'null',
				},
				started_at: {
					type: 'null',
				},
				share_link: {
					type: 'null',
				},
				completed_at: {
					type: 'null',
				},
				deleted_at: {
					type: 'null',
				},
			},
			required: [
				'session_reschedule',
				'is_feedback_skipped',
				'seats_remaining',
				'seats_limit',
				'type',
				'id',
				'title',
				'description',
				'start_date',
				'end_date',
				'recommended_for',
				'meeting_info',
				'categories',
				'medium',
				'time_zone',
				'image',
				'created_by',
				'updated_by',
				'mentor_id',
				'mentor_name',
				'status',
				'meta',
				'mentor_organization_id',
				'visibility',
				'visible_to_organizations',
				'mentee_feedback_question_set',
				'mentor_feedback_question_set',
				'updated_at',
				'created_at',
				'mentee_password',
				'mentor_password',
				'started_at',
				'share_link',
				'completed_at',
				'deleted_at',
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
const deleteSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'array',
			items: {},
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const updateSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'array',
			items: {},
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const startSchema = {
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
				link: {
					type: 'string',
				},
			},
			required: ['link'],
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const listSchema = {
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
									type: 'integer',
								},
								title: {
									type: 'string',
								},
								description: {
									type: 'string',
								},
								start_date: {
									type: 'string',
								},
								end_date: {
									type: 'string',
								},
								meta: {
									type: 'null',
								},
								recommended_for: {
									type: 'array',
									items: [
										{
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
									],
								},
								medium: {
									type: 'array',
									items: [
										{
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
									],
								},
								categories: {
									type: 'array',
									items: [
										{
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
									],
								},
								status: {
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
								image: {
									type: 'array',
									items: [
										{
											type: 'string',
										},
									],
								},
								mentor_id: {
									type: 'string',
								},
								visibility: {
									type: 'string',
								},
								mentor_organization_id: {
									type: 'string',
								},
								created_at: {
									type: 'string',
								},
								mentor_name: {
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
								is_enrolled: {
									type: 'boolean',
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
								index_number: {
									type: 'integer',
								},
							},
							required: [
								'id',
								'title',
								'description',
								'start_date',
								'end_date',
								'meta',
								'recommended_for',
								'medium',
								'categories',
								'status',
								'image',
								'mentor_id',
								'visibility',
								'mentor_organization_id',
								'created_at',
								'mentor_name',
								'meeting_info',
								'is_enrolled',
								'organization',
								'index_number',
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
const detailsSchema = {
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
				id: {
					type: 'integer',
				},
				title: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				recommended_for: {
					type: 'array',
					items: [
						{
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
					],
				},
				categories: {
					type: 'array',
					items: [
						{
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
					],
				},
				medium: {
					type: 'array',
					items: [
						{
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
					],
				},
				image: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
					],
				},
				mentor_id: {
					type: 'string',
				},
				session_reschedule: {
					type: 'integer',
				},
				status: {
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
				time_zone: {
					type: 'string',
				},
				start_date: {
					type: 'string',
				},
				end_date: {
					type: 'string',
				},
				started_at: {
					type: 'null',
				},
				completed_at: {
					type: 'null',
				},
				is_feedback_skipped: {
					type: 'boolean',
				},
				mentee_feedback_question_set: {
					type: 'string',
				},
				mentor_feedback_question_set: {
					type: 'string',
				},
				meeting_info: {
					type: 'object',
					properties: {
						link: {
							type: 'string',
						},
						value: {
							type: 'string',
						},
						platform: {
							type: 'string',
						},
					},
					required: ['link', 'value', 'platform'],
				},
				meta: {
					type: 'null',
				},
				visibility: {
					type: 'string',
				},
				visible_to_organizations: {
					type: 'array',
					items: [
						{
							type: 'string',
						},
					],
				},
				mentor_organization_id: {
					type: 'string',
				},
				seats_remaining: {
					type: 'integer',
				},
				seats_limit: {
					type: 'integer',
				},
				type: {
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
				mentor_name: {
					type: 'string',
				},
				created_by: {
					type: 'string',
				},
				updated_by: {
					type: 'string',
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
				is_enrolled: {
					type: 'boolean',
				},
				is_assigned: {
					type: 'boolean',
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
				mentor_designation: {
					type: 'null',
				},
			},
			required: [
				'id',
				'title',
				'description',
				'recommended_for',
				'categories',
				'medium',
				'image',
				'mentor_id',
				'session_reschedule',
				'status',
				'time_zone',
				'start_date',
				'end_date',
				'started_at',
				'completed_at',
				'is_feedback_skipped',
				'mentee_feedback_question_set',
				'mentor_feedback_question_set',
				'meeting_info',
				'meta',
				'visibility',
				'visible_to_organizations',
				'mentor_organization_id',
				'seats_remaining',
				'seats_limit',
				'type',
				'mentor_name',
				'created_by',
				'updated_by',
				'created_at',
				'updated_at',
				'deleted_at',
				'is_enrolled',
				'is_assigned',
				'organization',
				'mentor_designation',
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
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const updateRecordingUrlSchema = {
	$schema: 'http://json-schema.org/draft-04/schema#',
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'array',
			items: {},
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const enrollSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'array',
			items: {},
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}
const unenrollSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'array',
			items: {},
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
				},
			},
			required: ['formsVersion'],
		},
	},
	required: ['responseCode', 'message', 'result', 'meta'],
}

const completedSchema = {
	type: 'object',
	properties: {
		responseCode: {
			type: 'string',
		},
		message: {
			type: 'string',
		},
		result: {
			type: 'array',
			items: {},
		},
		meta: {
			type: 'object',
			properties: {
				formsVersion: {
					type: 'array',
					items: {},
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

module.exports = {
	createSchema,
	deleteSchema,
	updateSchema,
	startSchema,
	listSchema,
	detailsSchema,
	shareSchema,
	updateRecordingUrlSchema,
	enrollSchema,
	unenrollSchema,
	completedSchema,
}
