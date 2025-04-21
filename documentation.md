# Contract Analysis Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Installation & Setup](#installation--setup)
4. [API Keys Configuration](#api-keys-configuration)
   - [Google OAuth Setup](#google-oauth-setup)
   - [Gemini API Setup](#gemini-api-setup)
   - [Redis Setup (Upstash)](#redis-setup-upstash)
   - [Email Setup (Resend)](#email-setup-resend)
   - [Stripe Payment Integration](#stripe-payment-integration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

## Project Overview

This project is a Contract Analysis application that utilizes AI to analyze contracts. The application has a client-server architecture with various integrations including Google OAuth for authentication, Gemini API for AI analysis, Redis for caching, Resend for email notifications, and Stripe for payment processing.

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js
- **Database**: Redis (via Upstash)
- **Authentication**: Google OAuth
- **AI Integration**: Gemini API
- **Email Service**: Resend
- **Payment Processing**: Stripe
- **Containerization**: Docker
- **Version Control**: Git

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Docker and Docker Compose
- Git

### Step 1: Clone the Repository

```bash
# Clone the server repository
git clone [SERVER_REPOSITORY_URL] contract-analysis-server

# Clone the client repository
git clone [CLIENT_REPOSITORY_URL] contract-analysis-client
```

### Step 2: Install Dependencies

```bash
# Navigate to server directory and install dependencies
cd contract-analysis-server
npm install

# Navigate to client directory and install dependencies
cd ../contract-analysis-client
npm install
```

### Step 3: Set Up Environment Variables

```bash
# For server
cd ../contract-analysis-server
cp .env.template .env

# For client
cd ../contract-analysis-client
cp .env.template .env
```

### Step 4: Start Docker Containers

```bash
# Navigate to the server directory
cd ../contract-analysis-server

# Start Docker containers
docker-compose up -d
```

## API Keys Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Project name: `contract`
   - Organization: Select "No organization"
   - Click "Create"
3. Navigate to "API & Services" in the quick access menu
4. Click on "Credentials" in the sidebar
5. Click "Create Credentials" at the top and select "OAuth client ID"
6. Select "Configure Consent Screen"
7. Choose "External" as the user type and click "Create"
8. Fill in the application details:
   - App name: `contract-analysis`
   - User support email: Select your email
   - Developer contact information: Add your email
9. Click "Save and Continue" for the remaining steps
10. Click "Add or Remove Scopes" if needed, then "Save and Continue"
11. Click "Add Users" if needed for testing, then "Save and Continue"
12. Review the summary and click "Back to Dashboard"
13. Now, return to the Credentials page and click "Create Credentials" > "OAuth client ID"
14. Select "Web application" as the application type
15. Name: `contract`
16. Add the following authorized origins and redirects:
    - Authorized JavaScript origins: `http://localhost:3000`
    - Authorized redirect URIs: `http://localhost:8080/auth/google/callback`
17. Click "Create"
18. Copy the "Client ID" and "Client Secret" and add them to your server's `.env` file

### Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click on "Get API Key"
4. Click "Create API Key"
5. Select your project (the one named "contract")
6. Click "Create"
7. Copy the generated API key and add it to your server's `.env` file

### Redis Setup (Upstash)

1. Visit [Upstash](https://upstash.com/)
2. Sign up or log in
3. Click "Create Database"
4. Configure your database:
   - Name: `contract`
   - Select a primary region (any works)
   - Click "Next"
   - Select the free plan
   - Click "Next" and "Create"
5. From the REST API section, copy:
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
6. Add these values to your server's `.env` file

### Email Setup (Resend)

1. Visit [Resend](https://resend.com/home)
2. Sign up or log in
3. Navigate to "API Keys" in the sidebar
4. Click "Create API Key"
5. Name: `contract`
6. Permissions: Full Access
7. Click "Add"
8. Copy the generated API key and add it to your server's `.env` file
9. Open the server code, navigate to `services/email.service.ts` and update the email configuration:

```typescript
{
    from: 'onboarding@resend.dev',
    to: 'webnotess@gmail.com',
}
```

Note: If you want to send emails to multiple addresses, you'll need to set up a domain in Resend. This can be done in the "Domains" section of the Resend dashboard.

### Stripe Payment Integration

1. Visit [Stripe](https://stripe.com/in)
2. Sign up or log in
3. Go to "Developers" > "API Keys"
4. Copy the Secret key and add it to your server's `.env` file
5. Copy the Publishable key and add it to your client's `.env` file

#### Setting up Stripe Webhooks for Local Development

1. In the Stripe dashboard, go to "Developers" > "Webhooks"
2. Click "Test with a local listener"
3. Click "Download Stripe CLI"
4. Select Windows and download `stripe_1.26.1_windows_x86_64.zip`
5. Unzip the file
6. Create a folder called "StripeCLI" in Program Files
7. Move the Stripe application to this folder
8. Add the folder path to your system's PATH environment variable:
   - Right-click on "This PC" or "My Computer" and select "Properties"
   - Click on "Advanced system settings"
   - Click on "Environment Variables"
   - Under "System variables", find and select the "Path" variable
   - Click "Edit"
   - Click "New" and add the path to your StripeCLI folder
   - Click "OK" on all dialogs
9. Open a command prompt and run:
   ```bash
   stripe login
   ```
10. Follow the link provided and authorize the CLI
11. Once authorized, run:
    ```bash
    stripe listen --forward-to localhost:8080/payments/webhook
    ```
12. Copy the webhook signing secret that's displayed and add it to your server's `.env` file as `STRIPE_WEBHOOK_SECRET`

## Running the Application

### Server

```bash
# Navigate to the server directory
cd contract-analysis-server

# Start the server in development mode
npm run dev
```

### Client

```bash
# Navigate to the client directory
cd contract-analysis-client

# Start the client in development mode
npm start
```

## Troubleshooting

### Common Issues

1. **Docker Containers Not Starting**
   - Check Docker logs: `docker-compose logs`
   - Ensure ports are not in use by other applications

2. **API Keys Not Working**
   - Verify that you've correctly copied the keys without any whitespace
   - Ensure your `.env` files are properly formatted

3. **Stripe Webhook Issues**
   - Ensure the Stripe CLI is running and forwarding to the correct endpoint
   - Verify your webhook secret is correctly set in the `.env` file

4. **Email Service Not Working**
   - Check your Resend API key and verify it has not expired
   - Ensure the email addresses in `email.service.ts` are correctly configured

### Getting Help

If you encounter issues not covered in this documentation, please check the GitHub repositories for additional information or open an issue for support.