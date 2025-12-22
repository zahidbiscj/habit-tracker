# GitHub Actions Deployment Setup Guide

This guide will help you set up automatic deployment to Firebase Hosting using GitHub Actions.

## Prerequisites

1. Firebase project created and configured
2. GitHub repository initialized
3. Firebase CLI installed locally

## Step 1: Generate Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the gear icon ⚙️ → **Project Settings**
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file securely (you'll need it for the next step)

## Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following secrets:

### Required Secrets:

#### `FIREBASE_SERVICE_ACCOUNT`
- Click **New repository secret**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: Copy and paste the **entire contents** of the service account JSON file you downloaded in Step 1
- Click **Add secret**

#### `FIREBASE_PROJECT_ID`
- Click **New repository secret**
- Name: `FIREBASE_PROJECT_ID`
- Value: Your Firebase project ID (e.g., `habit-tracker-12345`)
  - You can find this in Firebase Console → Project Settings → General
- Click **Add secret**

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions, so you don't need to add it manually.

## Step 3: Initialize Firebase in Your Project

If you haven't already initialized Firebase, run:

```bash
# In project root directory
firebase login
firebase init

# Select:
# - Hosting
# - Firestore
# - Functions (if using Cloud Functions)
# - Choose existing project
# - Accept default settings or configure as needed
```

## Step 4: Verify Configuration Files

Ensure these files exist in your repository:

### `firebase.json`
```json
{
  "hosting": {
    "public": "webapp/dist/habit-tracker/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  }
}
```

### `.github/workflows/deploy.yml`
Already configured in your repository with:
- Build Angular application
- Install function dependencies
- Deploy to Firebase Hosting

## Step 5: Commit and Push to Trigger Deployment

```bash
# Stage all changes
git add .

# Commit changes
git commit -m "Configure GitHub Actions deployment"

# Push to main branch (triggers deployment)
git push origin main
```

## Step 6: Monitor Deployment

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You should see a workflow run for "Deploy to Firebase Hosting"
4. Click on the workflow to see detailed logs
5. Once complete, your app will be live at: `https://YOUR_PROJECT_ID.web.app`

## Workflow Features

### Automatic Deployment
- Triggers on every push to `main` branch
- Automatically builds and deploys your Angular app

### Manual Deployment
- Can also be triggered manually from GitHub Actions tab
- Click **Run workflow** → Select branch → **Run workflow**

### Build Steps
1. **Checkout code** - Gets latest code from repository
2. **Setup Node.js** - Installs Node.js 20 with npm caching
3. **Install dependencies** - Runs `npm ci` for webapp and functions
4. **Build Angular app** - Creates production build
5. **Deploy to Firebase** - Uploads to Firebase Hosting

## Troubleshooting

### Build Fails with "Module not found"
- Ensure all dependencies are in `package.json`
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Commit the updated `package-lock.json`

### Deployment Fails with "Permission denied"
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is correctly copied (entire JSON)
- Check that service account has necessary permissions in Firebase Console
- Ensure project ID in secret matches your Firebase project

### Wrong Output Path Error
- Verify `firebase.json` points to correct path: `webapp/dist/habit-tracker/browser`
- Check `angular.json` output path matches: `dist/habit-tracker`

### Workflow Doesn't Trigger
- Ensure workflow file is in `.github/workflows/` directory
- Check branch name matches trigger (currently set to `main`)
- Verify you have permissions to run Actions in your repository

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit** the service account JSON file to your repository
2. **Always use** GitHub Secrets for sensitive data
3. **Regularly rotate** service account keys
4. **Limit permissions** on service accounts to only what's needed
5. **Review** the Actions logs to ensure no secrets are exposed

## Firebase Hosting URLs

After successful deployment, your app will be available at:

- **Production URL**: `https://YOUR_PROJECT_ID.web.app`
- **Alternative URL**: `https://YOUR_PROJECT_ID.firebaseapp.com`

You can also add custom domains in Firebase Console → Hosting → Add custom domain

## Environment Variables

If you need environment-specific configurations:

1. Create environment files:
   - `webapp/src/environments/environment.ts` (development)
   - `webapp/src/environments/environment.prod.ts` (production)

2. Angular automatically uses the correct environment during build

3. Never commit sensitive keys to environment files - use Firebase Remote Config or GitHub Secrets

## Next Steps

After successful deployment:

1. ✅ Set up Firestore security rules
2. ✅ Configure Firebase Authentication
3. ✅ Set up custom domain (optional)
4. ✅ Enable Firebase Analytics
5. ✅ Configure Cloud Functions for notifications
6. ✅ Set up monitoring and alerts

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Angular Deployment Guide](https://angular.io/guide/deployment)

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Review Firebase Console for deployment status
3. Verify all secrets are correctly configured
4. Ensure billing is enabled for Firebase (if using Cloud Functions)

---

**Last Updated**: December 22, 2025
