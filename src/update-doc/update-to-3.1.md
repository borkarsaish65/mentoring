# Backend

# Frontend

1- Update environment files
---------------------------

Latest environment file sample i am attaching below.

export const environment = {
  production: true,
  name: 'MentorED',
  staging: false,
  dev: false,
  baseUrl: 'your api base_url',
  sqliteDBName: 'db_name',
  deepLinkUrl: 'deeplink_url',
  privacyPolicyUrl:'privacy_policy_url',
  termsOfServiceUrl:'terms_of_use_url',
  supportEmail: "<email to show in UI for support option>",
  recaptchaSiteKey:"<recaptcha_sitekey> (if using captcha verification>",
  restictedPages: ["restricted_pages_id_1", "restricted_pages_id_2"](if any pages should be restricted in frontend. Please refer pageId.ts file for page ids),
  isAuthBypassed: false (if authentication flows should be bypassed or not)
  unauthorizedRedirectUrl: "auth/login(url to be redirected when unauthorised request happens)",
  password:{
    minLength:10 (minimum password length),
    rejectPattern:"regex for password validation",
    errorMessage:"error message for password"
  },
};



2- Get the latest git tag for 3.1 branch and deploy the frontend code.
----------------------------------------------------------------------

latest 3.1 tag: release-3.0.1_RC21



3- Do form migration. 
---------------------

- Confirm the forms added in form.json file
- Run below commands for setting headers for migration
    export AUTH_TOKEN=<Valid user token>
    export API_URL=<API base url for form update>

- And then run the migration script.
    npm run manage-forms

