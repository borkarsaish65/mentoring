#!/usr/bin/env node

/**
 * Production Migration Runner for Mentoring Service
 * Handles 30+ lakh records with Citus distribution
 */

const CitusMentoringDataMigrator = require('./mentoring-data-migration')
const readline = require('readline')

console.log('🎯 Production Mentoring Service Data Migration')
console.log('==============================================')

// Configuration check
console.log('\n📋 Environment Configuration:')
console.log(`   Database URL: ${process.env.DEV_DATABASE_URL ? '✅ Set' : '❌ Missing'}`)
console.log(`   Default Tenant: ${process.env.DEFAULT_ORGANISATION_CODE || 'DEFAULT_TENANT'}`)
console.log(`   Default Org Code: ${process.env.DEFAULT_ORG_CODE || 'DEFAULT_ORG'}`)
console.log(`   Default Org ID: ${process.env.DEFAULT_ORG_ID || '1'}`)

// Check CSV files
const fs = require('fs')
const path = require('path')

console.log('\n📁 CSV Files Status:')
const csvFiles = ['organizations.csv', 'users.csv', 'user_organizations.csv']
let allFilesExist = true

csvFiles.forEach((file) => {
	const filePath = path.join(__dirname, 'data', file)
	const exists = fs.existsSync(filePath)
	console.log(`   ${file}: ${exists ? '✅ Found' : '❌ Missing'}`)
	if (!allFilesExist) allFilesExist = false

	if (exists) {
		const stats = fs.statSync(filePath)
		const sizeKB = Math.round(stats.size / 1024)
		console.log(`     Size: ${sizeKB}KB, Modified: ${stats.mtime.toISOString().split('T')[0]}`)
	}
})

// Migration plan
console.log('\n📋 Migration Plan:')
console.log('   Tables to process: 11 (with organization_id)')
console.log('   Update strategy: Undistribute → Update → Redistribute')
console.log('   Batch size: 1000 records per batch')
console.log('   Estimated time: 2-4 hours for 30 lakh records')
console.log('   Safety: All operations are transactional with retry logic')

console.log('\n⚠️  IMPORTANT WARNINGS:')
console.log('   • This will temporarily undistribute tables (causes brief unavailability)')
console.log('   • Updates are applied to organization_code only (tenant_code preserved)')
console.log('   • Process can be interrupted and resumed safely')
console.log('   • Database will be locked during batch updates')
console.log('   • Monitor disk space for redistribution operations')

if (!allFilesExist) {
	console.log('\n❌ MISSING CSV FILES:')
	console.log('   Please export data from user service first:')
	console.log('   1. Run queries from export-queries.sql in user service')
	console.log('   2. Save results as CSV files in ./data/ directory')
	console.log('   3. Re-run this script')
	process.exit(1)
}

// Prompt for confirmation
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

rl.question('\n🤔 Proceed with production migration? (y/N): ', async (answer) => {
	if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
		console.log('\n🚀 Starting production migration...')
		console.log('   ⏰ Started at:', new Date().toISOString())
		rl.close()

		try {
			const migrator = new CitusMentoringDataMigrator()

			// Production configuration
			migrator.batchSize = 1000
			migrator.maxRetries = 5
			migrator.retryDelay = 3000
			migrator.progressInterval = 10000

			console.log('\n📊 Production Settings:')
			console.log(`   Batch size: ${migrator.batchSize}`)
			console.log(`   Max retries: ${migrator.maxRetries}`)
			console.log(`   Progress updates: Every ${migrator.progressInterval} records`)

			await migrator.execute()

			console.log('\n🎉 Production migration completed successfully!')
			console.log('   ⏰ Finished at:', new Date().toISOString())
			process.exit(0)
		} catch (error) {
			console.error('\n❌ Production migration failed:', error)
			console.log('   ⏰ Failed at:', new Date().toISOString())
			console.log('\n🔧 Troubleshooting:')
			console.log('   • Check database connectivity')
			console.log('   • Verify CSV file integrity')
			console.log('   • Check disk space for redistribution')
			console.log('   • Review error logs above')
			process.exit(1)
		}
	} else {
		console.log('\n❌ Migration cancelled by user')
		console.log('   Use test-citus-migration.js for testing')
		rl.close()
		process.exit(0)
	}
})
