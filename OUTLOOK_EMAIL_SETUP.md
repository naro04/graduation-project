# Outlook Email Setup for Railway

## Step 1: Create Outlook Email Account
1. Go to https://outlook.live.com or https://outlook.office.com
2. Create a new email account (e.g., `yourproject@outlook.com` or `yourproject@hotmail.com`)

## Step 2: Enable App Password (Required for SMTP)

### For Outlook.com / Hotmail.com:
1. Go to https://account.microsoft.com/security
2. Sign in with your Outlook email
3. Click on **Security** → **Advanced security options**
4. Under **App passwords**, click **Create a new app password**
5. Give it a name (e.g., "HR System Railway")
6. **Copy the generated password** (you'll need this for Railway)

### For Office 365 / Microsoft 365:
1. Go to https://account.microsoft.com/security
2. Sign in with your Office 365 account
3. Enable **Two-step verification** if not already enabled
4. Go to **App passwords** and create a new one
5. **Copy the generated password**

## Step 3: Add Variables to Railway

In your Railway project, go to **Variables** tab and add:

```
EMAIL_HOST = smtp-mail.outlook.com
EMAIL_PORT = 587
EMAIL_USER = your-email@outlook.com
EMAIL_PASS = your-app-password-here
EMAIL_FROM = your-email@outlook.com
```

### Alternative for Office 365:
If you're using Office 365 (business email), use:
```
EMAIL_HOST = smtp.office365.com
EMAIL_PORT = 587
EMAIL_USER = your-email@yourcompany.com
EMAIL_PASS = your-app-password-here
EMAIL_FROM = your-email@yourcompany.com
```

## Important Notes:
- ✅ Use **App Password**, NOT your regular email password
- ✅ Port **587** is recommended (TLS)
- ✅ The app password is a 16-character code (e.g., `abcd efgh ijkl mnop`)
- ✅ Remove spaces when entering in Railway

## Testing:
After adding the variables, redeploy your backend. The password reset emails will be sent from your Outlook account.


