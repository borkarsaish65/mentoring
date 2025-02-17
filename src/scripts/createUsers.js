const axios = require('axios')
const { faker } = require('@faker-js/faker') // Updated faker import

// Base URL and endpoint
const BASE_URL = 'http://localhost:3569/interface/v1/account/create'

// Function to create n user accounts
async function createUsers(n) {
	for (let i = 1; i <= n; i++) {
		const randomName = faker.name.firstName() // Generate a random first name
		const randomEmail = `${randomName.toLowerCase()}${i}@test.com` // Consistent email format
		const randomQualification = faker.name.jobTitle() // Generate a random qualification

		const payload = {
			name: randomName,
			email: randomEmail,
			password: 'PASSword###11',
			designation: ['beo', 'deo'],
			area_of_expertise: ['educational_leadership', 'sqaa'],
			education_qualification: randomQualification,
			gender: 'male',
		}

		try {
			const response = await axios.post(BASE_URL, payload, {
				headers: {
					'Content-Type': 'application/json',
				},
			})
			console.log(`User ${i} created:`, response.data)
		} catch (error) {
			console.error(`Error creating user ${i}:`, error.response ? error.response.data : error.message)
		}
	}
}

// Call the function to create n users
const numberOfUsers = 80 // Replace with the desired number of users
createUsers(numberOfUsers)
