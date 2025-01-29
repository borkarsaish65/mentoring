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
				version: {
					type: 'integer',
				},
				id: {
					type: 'integer',
				},
				type: {
					type: 'string',
				},
				sub_type: {
					type: 'string',
				},
				data: {
					type: 'object',
					properties: {
						template_name: {
							type: 'string',
						},
						fields: {
							type: 'object',
							properties: {
								controls: {
									type: 'array',
									items: [
										{
											type: 'object',
											properties: {
												name: {
													type: 'string',
												},
												label: {
													type: 'string',
												},
												value: {
													type: 'string',
												},
												class: {
													type: 'string',
												},
												type: {
													type: 'string',
												},
												position: {
													type: 'string',
												},
												disabled: {
													type: 'boolean',
												},
												showSelectAll: {
													type: 'boolean',
												},
												validators: {
													type: 'object',
													properties: {
														required: {
															type: 'boolean',
														},
													},
													required: ['required'],
												},
											},
											required: [
												'name',
												'label',
												'value',
												'class',
												'type',
												'position',
												'disabled',
												'showSelectAll',
												'validators',
											],
										},
									],
								},
							},
							required: ['controls'],
						},
					},
					required: ['template_name', 'fields'],
				},
				organization_id: {
					type: 'string',
				},
				updated_at: {
					type: 'string',
				},
				created_at: {
					type: 'string',
				},
				deleted_at: {
					type: 'null',
				},
			},
			required: [
				'version',
				'id',
				'type',
				'sub_type',
				'data',
				'organization_id',
				'updated_at',
				'created_at',
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
const readSchema = {
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
					],
				},
				correlation: {
					type: 'string',
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

module.exports = {
	createSchema,
	readSchema,
	updateSchema,
}
