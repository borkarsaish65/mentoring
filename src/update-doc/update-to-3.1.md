# Backend

# Upgrading to Version 3.1

## 1. Cleaning the Existing Database

For each mentoring-related database, drop the existing database by running the following command. Replace `database_name` with the relevant database value.

```bash
DROP DATABASE "database_name";
```

## 2. Clearing Redis Data

Run the following command to clear all Redis data:

```bash
redis-cli flushall
```

## 3. Update Mentoring Repositories to 3.1

Navigate to the corresponding directories (`/mentoring`, `/user`, `/notification`, `/scheduler`) and run the following command to switch to the `master` branch and pull the latest changes:

```bash
git checkout master && git pull origin master
```

For `/interface`, switch to the `main` branch:

```bash
git checkout main && git pull origin main
```

Also delete `node_modules` , `package-lock.json` and run `npm i` from all the services inside /src

## 4. Database Initialization and Seeding

### 4.1. Mentoring Service

Navigate to `mentoring/src` and run the following commands to initialize the database and seed all data:

```bash
npm run db:init && npm run db:seed:all
```

Then, execute the necessary scripts:

```bash
cd scripts/
node viewsScript.js
node psqlFunction.js
```

### 4.2. User Service

Navigate to `user/src` and run the following commands to initialize the database and seed all data:

```bash
npm run db:init && npm run db:seed:all
```

Then, execute the necessary scripts:

```bash
cd scripts/
node insertDefaultOrg.js
```

Ensure that the default organization ID is set to `1`, and verify that it is also the ID used in the mentoring service.

```bash
node uploadSampleCSV.js
node viewsScript.js
```

## 5. .env Changes

There are new environment variables added in the 3.1 release. Keep a backup of the existing `.env` files across services, as this can help reference AWS secrets, Host name, BBB host etc.

### Sample Mentoring Service `.env`:

<details>
  <summary>ENV</summary>

```env
ACCESS_TOKEN_SECRET= "46b25a59f758ffe3fb95c1c1d91bc4f391f0a3c18d2c95985d80ac53db82df3b"
ALLOWED_HOST= "https://mentoring.ALLOWED_HOST.org"
API_DOC_URL= "/mentoring/api-doc"
APPLICATION_BASE_URL= "/mentoring/"
APPLICATION_ENV= "development"
APPLICATION_HOST= "http://localhost:7101"
APPLICATION_PORT= "7101"
AUTH_METHOD= "native"
BIB_BLUE_BUTTON_BASE_URL= "/bigbluebutton/"
BIG_BLUE_BUTTON_SECRET_KEY= "BIG_BLUE_BUTTON_SECRET_KEY"
BIG_BLUE_BUTTON_SESSION_END_URL= "https%3A%2F%2Fmentoring.BIG_BLUE_BUTTON_SESSION_END_URL.org%2F"
BIG_BLUE_BUTTON_URL= "https://bbb.BIG_BLUE_BUTTON_URL.org"
CLEAR_INTERNAL_CACHE= "mentoringinternal"
CLOUD_STORAGE= "GCP"
CLOUD_STORAGE_ACCOUNTNAME= "CLOUD_STORAGE_ACCOUNTNAME"
CLOUD_STORAGE_BUCKETNAME= "CLOUD_STORAGE_BUCKETNAME"
CLOUD_STORAGE_BUCKET_TYPE= "private"
CLOUD_STORAGE_PROJECT= "CLOUD_STORAGE_PROJECT"
CLOUD_STORAGE_PROVIDER= "gcloud"
CLOUD_STORAGE_SECRET= "CLOUD_STORAGE_SECRET"
CSV_MAX_ROW= "20"
DEFAULT_MEETING_SERVICE= "BBB"
DEFAULT_ORGANISATION_CODE= "default_code"
DEFAULT_ORG_ID= "1"
DEFAULT_QUEUE= "mentoring-queue"
DEV_DATABASE_URL= "postgres://user:password@localhost:9700/elevate_mentoring"
DISABLE_LOG= "false"
DOWNLOAD_URL_EXPIRATION_DURATION= "300000"
EMAIL_ID_ENCRYPTION_ALGORITHM= "aes-256-cbc"
EMAIL_ID_ENCRYPTION_IV= "9ee3144508244356ed770a30b5818364"
EMAIL_ID_ENCRYPTION_KEY= "75a40b6af533c5ebd2a5787d8455bf09a478f0bc29421ffc1b2dbea4365b4575"
ENABLE_EMAIL_FOR_REPORT_ISSUE= "true"
ERROR_LOG_LEVEL= "silly"
INTERNAL_ACCESS_TOKEN= "INTERNAL_ACCESS_TOKEN"
INTERNAL_CACHE_EXP_TIME= "86400"
IS_EXTERNAL_USER_SERVICE= "false"
IV= "IV"
KAFKA_GROUP_ID= "qa.mentoring"
KAFKA_TOPIC= "qa.topic"
KAFKA_URL= "localhost:9092"
KEY= "KEY"
MEETING_END_CALLBACK_EVENTS= "https%3A%2F%2Fqa.mentoring.shikshalokam.org%2Fmentoring%2Fv1%2Fsessions%2Fcompleted"
MENTEE_SESSION_CANCELLATION_EMAIL_TEMPLATE= "mentee_session_cancel"
MENTEE_SESSION_EDITED_BY_MANAGER_EMAIL_TEMPLATE= "mentee_session_edited_by_manager_email_template"
MENTEE_SESSION_ENROLLMENT_BY_MANAGER_EMAIL_TEMPLATE= "mentee_session_enrollment_by_manager"
MENTEE_SESSION_ENROLLMENT_EMAIL_TEMPLATE= "mentee_session_enrollment"
MENTOR_PRIVATE_SESSION_INVITE_BY_MANAGER_EMAIL_TEMPLATE= "mentor_invite_private_session_by_manager"
MENTOR_PUBLIC_SESSION_INVITE_BY_MANAGER_EMAIL_TEMPLATE= "mentor_invite_public_session_by_manager"
MENTOR_SECRET_CODE= "4567"
MENTOR_SESSION_DELETE_BY_MANAGER_EMAIL_TEMPLATE= "session_deleted_by_manager"
MENTOR_SESSION_DELETE_EMAIL_TEMPLATE= "mentor_session_delete"
MENTOR_SESSION_EDITED_BY_MANAGER_EMAIL_TEMPLATE= "mentor_session_edited_by_manager_email_template"
MENTOR_SESSION_RESCHEDULE_EMAIL_TEMPLATE= "mentor_session_reschedule"
MONGODB_URL= "mongodb://localhost:27018/mentoring"
NOTIFICATION_KAFKA_TOPIC= "qa.notification"
PUBLIC_ASSET_BUCKETNAME= "mentoring-dev-storage-public"
RATING_KAFKA_TOPIC= "qa.mentor_rating"
RECORDING_READY_CALLBACK_URL= "https%3A%2F%2HOST%2Fmentoring%2Fv1%2Fsessions%2FrecordingStats"
REDIS_HOST= "redis://localhost:6379"
REFRESH_VIEW_INTERVAL= "30000"
REPORT_ISSUE_EMAIL_TEMPLATE_CODE= "user_issue_reported"
SALT_ROUNDS= "10"
SAMPLE_CSV_FILE_PATH= "sample/bulk_session_creation.csv"
SCHEDULER_SERVICE_BASE_URL= "/scheduler/"
SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID= "SAMPLE@SAMPLE.com"
SCHEDULER_SERVICE_HOST= "http://localhost:3567"
SCHEDULER_SERVICE_URL= "http://localhost:3567/jobs/scheduleJob"
SEESION_MANAGER_AND_MENTEE_LIMIT= "6"
SESSION_CREATION_MENTOR_LIMIT= "1"
SESSION_EDIT_WINDOW_MINUTES= "0"
SESSION_MENTEE_LIMIT= "7"
SESSION_TITLE_EDITED_BY_MANAGER_EMAIL_TEMPLATE= "session_title_edited_by_manager_email_template"
SESSION_UPLOAD_EMAIL_TEMPLATE_CODE= "bulk_upload_session"
SESSION_VERIFICATION_METHOD= "user_service_authenticated"
SIGNED_URL_EXPIRY_IN_MILLISECONDS= "120000"
SUPPORT_EMAIL_ID= "support@SAMPLE.org"
USER_SERVICE_BASE_URL= "/user/"
USER_SERVICE_HOST= "http://localhost:3567"

```

</details>

### Sample User Service `.env`:

<details>
  <summary>ENV</summary>

```env
ACCESS_TOKEN_EXPIRY= "30m"
ACCESS_TOKEN_SECRET= "46b25a59f758ffe3fb95c1c1d91bc4f391f0a3c18d2c95985d80ac53db82df3b"
ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE= "invitee_upload_status"
ADMIN_SECRET_CODE= "46b25a59f758ffe3fb95c1c1d91bc4f391f0a3c18d2c95985d80ac53db82df3b"
ALLOWED_HOST= "https://mentoring.ALLOWED_HOST.org"
ALLOWED_IDLE_TIME= "3600"
API_DOC_URL= "/user/api-doc"
APPLICATION_BASE_URL= "/user"
APPLICATION_ENV= "development"
APPLICATION_HOST= "http://localhost:7001"
APPLICATION_PORT= "7001"
APP_NAME= "MentorED"
CAPTCHA_ENABLE= "false"
CAPTCHA_SERVICE= "googleRecaptcha"
CHANGE_PASSWORD_TEMPLATE_CODE= "change_password"
CLEAR_INTERNAL_CACHE= "userinternal"
CLOUD_STORAGE_ACCOUNTNAME= "CLOUD_STORAGE_ACCOUNTNAME"
CLOUD_STORAGE_BUCKETNAME= "CLOUD_STORAGE_BUCKETNAME"
CLOUD_STORAGE_BUCKET_TYPE= "private"
CLOUD_STORAGE_PROJECT= "CLOUD_STORAGE_PROJECT"
CLOUD_STORAGE_PROVIDER= "gcloud"
CLOUD_STORAGE_SECRET= "CLOUD_STORAGE_SECRET"
DEFAULT_ORGANISATION_CODE= "default_code"
DEFAULT_ORG_ID= "1"
DEFAULT_QUEUE= "defaultUser-queue"
DEFAULT_ROLE= "mentee"
DEV_DATABASE_URL= "postgres://user:password@localhost:9700/elevate_user"
DISABLE_LOG= "false"
DOWNLOAD_URL_EXPIRATION_DURATION= "300000"
EMAIL_ID_ENCRYPTION_ALGORITHM= "aes-256-cbc"
EMAIL_ID_ENCRYPTION_IV= "9ee3144508244356ed770a30b5818364"
EMAIL_ID_ENCRYPTION_KEY= "75a40b6af533c5ebd2a5787d8455bf09a478f0bc29421ffc1b2dbea4365b4575"
ENABLE_EMAIL_OTP_VERIFICATION= "true"
ENABLE_LOG= "true"
ERROR_LOG_LEVEL= "silly"
EVENT_ENABLE_ORG_EVENTS= "true"
EVENT_ORG_LISTENER_URLS= "http://localhost:3567/mentoring/v1/organization/eventListener"
GENERIC_INVITATION_EMAIL_TEMPLATE_CODE= "generic_invite"
GOOGLE_RECAPTCHA_HOST= "https://www.google.com"
GOOGLE_RECAPTCHA_URL= "/recaptcha/api/siteverify"
INTERNAL_ACCESS_TOKEN= "INTERNAL_ACCESS_TOKEN"
INTERNAL_CACHE_EXP_TIME= "86400"
INVITEE_EMAIL_TEMPLATE_CODE= "invite_user"
IV= "IV"
KAFKA_GROUP_ID= "qa.users"
KAFKA_TOPIC= "qa.topic"
KAFKA_URL= "localhost:9092"
KEY= "KEY"
MENTEE_INVITATION_EMAIL_TEMPLATE_CODE= "invite_mentee"
MENTORING_SERVICE_URL= "http://localhost:3567"
MENTOR_INVITATION_EMAIL_TEMPLATE_CODE= "invite_mentor"
MENTOR_REQUEST_ACCEPTED_EMAIL_TEMPLATE_CODE= "mentor_request_accepted"
MENTOR_REQUEST_REJECTED_EMAIL_TEMPLATE_CODE= "mentor_request_rejected"
MENTOR_SECRET_CODE= "4567"
MONGODB_URL= "mongodb://localhost:27018/users"
NOTIFICATION_KAFKA_TOPIC= "qa.notification"
ORG_ADMIN_INVITATION_EMAIL_TEMPLATE_CODE= "invite_org_admin"
OTP_EMAIL_TEMPLATE_CODE= "emailotp"
OTP_EXP_TIME= "86400"
PASSWORD_POLICY_MESSAGE= "Password must have at least two uppercase letter, two number, three special character, and be at least 11 characters long"
PASSWORD_POLICY_REGEX= "^(?=(?:.*[A-Z]){2})(?=(?:.*[0-9]){2})(?=(?:.*[!@#%$&()\\-`.+,]){3}).{11,}$"
PASSWORD_POLICY_REGEXOLD= "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%$&()\\-`.+,/]).{10,}$"
PORTAL_URL= "https://mentoring.PORTAL_URL.org/auth/login"
PUBLIC_ASSET_BUCKETNAME= "mentoring-dev-storage-public"
RATING_KAFKA_TOPIC= "qa.mentor_rating"
RECAPTCHA_SECRET_KEY= "RECAPTCHA_SECRET_KEY"
REDIS_HOST= "redis://localhost:6379"
REFRESH_TOKEN_EXPIRY= "7"
REFRESH_TOKEN_SECRET= "REFRESH_TOKEN_SECRET"
REFRESH_VIEW_INTERVAL= "30000"
REGISTRATION_EMAIL_TEMPLATE_CODE= "registration"
REGISTRATION_OTP_EMAIL_TEMPLATE_CODE= "registrationotp"
SALT_ROUNDS= "10"
SAMPLE_CSV_FILE_PATH= "sample/bulk_user_creation.csv"
SCHEDULER_SERVICE_BASE_URL= "/scheduler/"
SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID= "error@sample.com"
SCHEDULER_SERVICE_HOST= "http://localhost:3567"
SCHEDULER_SERVICE_URL= "http://localhost:3567/jobs/scheduleJob"
SIGNED_URL_EXPIRY_IN_MILLISECONDS= "120000"
```

</details>

### Sample Notification Service `.env`:

<details>
  <summary>ENV</summary>

```env
API_DOC_URL= "/notification/api-doc"
APPLICATION_BASE_URL= "/notification/"
APPLICATION_ENV= "development"
APPLICATION_PORT= "7201"
DEV_DATABASE_URL= "postgres://user:password@localhost/elevate_notification"
DISABLE_LOG= "false"
ERROR_LOG_LEVEL= "silly"
KAFKA_GROUP_ID= "qa-elevate-notification"
KAFKA_HOST= "localhost:9092"
KAFKA_TOPIC= "qa.notification"
SENDGRID_API_KEY= "SG.SAMPLE"
SENDGRID_FROM_MAIL= "no-reply@sample.org"
```

</details>

### Sample Interface Service `.env`:

<details>
  <summary>ENV</summary>

```env
ALLOWED_HOST= "https://mentoring.ALLOWED_HOST.org"
API_DOC_URL= "/interface/api-doc"
APPLICATION_ENV= "development"
APPLICATION_PORT= "3567"
INSTALLED_PACKAGES= "elevate-user elevate-mentoring elevate-scheduler"
MENTORING_SERVICE_BASE_URL= "http://localhost:7101"
NOTIFICATION_SERVICE_BASE_URL= "http://localhost:7201"
RATE_LIMITER_ENABLED= "true"
RATE_LIMITER_GENERAL_LIMIT= "50"
RATE_LIMITER_NUMBER_OF_PROXIES= "3"
RATE_LIMITER_PUBLIC_LOW_LIMIT= "5"
REQUIRED_PACKAGES= "elevate-user@1.1.71 elevate-mentoring@1.1.56 elevate-scheduler@1.0.4"
SCHEDULER_SERVICE_BASE_URL= "http://localhost:7401"
SUPPORTED_HTTP_TYPES= "GET POST PUT PATCH DELETE"
USER_SERVICE_BASE_URL= "http://localhost:7001"

```

</details>

### Sample Scheduler Service `.env`:

<details>
  <summary>ENV</summary>

```env
API_DOC_URL= "/scheduler/api-doc"
APPLICATION_BASE_URL= "/scheduler/"
APPLICATION_PORT= "7401"
DEFAULT_QUEUE= "email"
DISABLE_LOG= "false"
ERROR_LOG_LEVEL= "silly"
KAFKA_URL= "localhost:9092"
MONGODB_URL= "mongodb://localhost:27018/tl-cron-rest"
NOTIFICATION_KAFKA_TOPIC= "qa.notifications"
REDIS_HOST= "localhost"
REDIS_PORT= "6379"
```

</details>

### Additional info

You can generate the keys needed for EMAIL_ID_ENCRYPTION_IV, EMAIL_ID_ENCRYPTION_KEY using cd ~/user/src/scripts and node generateEncyrptionKeys.js. Both keys should be same in both services.

Sample cloud config:

```env
CLOUD_STORAGE_PROVIDER=aws
CLOUD_STORAGE_BUCKETNAME=storage-private
CLOUD_STORAGE_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
CLOUD_STORAGE_REGION=ap-south-1
CLOUD_ENDPOINT=s3.ap-south-1.amazonaws.com
CLOUD_STORAGE_ACCOUNTNAME=AKIAIOSFODNN7EXAMPLE
PUBLIC_ASSET_BUCKETNAME=storage-public
CLOUD_STORAGE_BUCKET_TYPE=private
```

## 6. Restart the service

use the `pm2 restart app_name` command to restart all the services.

#### BigBlueButton

Possible fixes for BBB:

1. `sudo bbb-conf --setip bbb.mybbbserver.com`
   OR
   `sudo bbb-conf --setip 192.168.0.211 `
   `sudo bbb-conf --clean`
   `sudo bbb-conf --check`
2. Check if the BBB secrets are correct in mentoring env.
   To generate new:
   `bbb-conf --setsecret`
   and follow the steps. Replaced BBB secret key in mentoring .env with the new one.

## To create admin account:

Run the below curl

```curl
curl --location 'http://localhost:3567/user/v1/admin/create' \
--header 'internal_access_token: INTERNAL_ACCESS_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "system",
    "email": "system@admin.com",
    "password": "PAssword@@@123",
    "secret_code": "46b25a59f758ffe3fb95c1c1d91bc4f391f0a3c18d2c95985d80ac53db82df3b"
}'
```

Log in:

```curl
curl --location 'http://localhost:3567/user/v1/admin/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "system@admin.com",
    "password": "PAssword@@@123"
}'
```

Create profile:
Replace the {{TOKEN}} with access_token value from the log in response.

```curl
curl --location 'http://localhost:3567/mentoring/v1/profile/create' \
--header 'X-auth-token: bearer {{TOKEN}}' \
--header 'Content-Type: application/json' \
--data '{
    "designation": [
        "beo",
        "deo"
    ],
    "area_of_expertise": [
        "educational_leadership",
        "sqaa"
    ],
    "education_qualification": "MBA",
    "gender": "male"
}'
```

## To assign an org admin

Replace the {{TOKEN}} with access_token value from the log in response(admin user from previous step).
Make sure the said email and org id exists

```curl
curl --location 'http://localhost:3567/user/v1/admin/addOrgAdmin' \
--header 'X-auth-token: bearer {{TOKEN}}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "user@test.com",
    "organization_id": 1
}'
```

## Final Notes

-   Make sure all services are using the latest updates from their respective branches (`master` for `/mentoring`, `/user`, `/notification`, `/scheduler` and `main` for `/interface`).
-   Verify that the default organization ID matches across the services.

---

# Frontend

## 1. Update Environment Files

Below is a sample environment file for the frontend:

```javascript
export const environment = {
	production: true,
	name: 'MentorED',
	staging: false,
	dev: false,
	baseUrl: 'your api base_url',
	sqliteDBName: 'db_name',
	deepLinkUrl: 'deeplink_url',
	privacyPolicyUrl: 'privacy_policy_url',
	termsOfServiceUrl: 'terms_of_use_url',
	supportEmail: '<email to show in UI for support option>',
	recaptchaSiteKey: '<recaptcha_sitekey> (if using captcha verification)',
	restrictedPages: ['restricted_pages_id_1', 'restricted_pages_id_2'], // If any pages should be restricted in frontend. Please refer to `pageId.ts` for page IDs
	isAuthBypassed: false, // If authentication flows should be bypassed or not
	unauthorizedRedirectUrl: 'auth/login', // URL to be redirected to when unauthorized requests happen
	password: {
		minLength: 10, // Minimum password length
		rejectPattern: 'regex for password validation',
		errorMessage: 'error message for password validation',
	},
}
```

## 2. Get the Latest Git Tag for 3.1 Branch and Deploy the Frontend Code

The latest 3.1 tag is:

```bash
release-3.0.1_RC21
```

Deploy the frontend code with the appropriate tag.

## 3. Form Migration

-   Confirm that the necessary forms are added in the `form.json` file.
-   Run the following commands to set the headers for the migration:

```bash
export AUTH_TOKEN=<Valid user token>
export API_URL=<API base url for form update>
```

-   Then run the migration script:

```bash
npm run manage-forms
```

## 4. Bannering/Configuring Theme, Logo, & App Name

-   Changing the theme color of the application:
    Open the 'global.scss' file. And change the value of the '--ion-color-primary' property to the new theme color you want to add.

-   Changing the logo:
    Replace the 'favicon.png' with the new logo. you can find the favicon.png file inside icon folder which is inside assets folder. Path to reach the logo will be 'assets/icon/favicon.png'.
    Resolution for logo will be 128 × 128 pixels.

-   Changing the app name:
    Open 'index.html' file. Change the app name given inside title tag to the new name you want.
