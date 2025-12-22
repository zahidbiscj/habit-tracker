# Quick Deployment Guide

## 🚀 Deploy to Firebase with GitHub Actions

This project is configured for automatic deployment using GitHub Actions. Follow these steps to set up and deploy.

## Prerequisites

- [ ] Firebase project created
- [ ] GitHub repository created
- [ ] Firebase CLI installed: `npm install -g firebase-tools`

## Step-by-Step Setup

### 1️⃣ Update Firebase Project ID

Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 2️⃣ Get Firebase Service Account

```bash
# Login to Firebase
firebase login

# Generate service account key
# Or go to: https://console.firebase.google.com/
# → Project Settings → Service Accounts → Generate New Private Key
```

### 3️⃣ Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `FIREBASE_SERVICE_ACCOUNT` | Entire JSON content from service account file | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | Firebase Console → Project Settings |

### 4️⃣ Commit and Push

```bash
# Add all files
git add .

# Commit changes
git commit -m "Setup Firebase deployment"

# Push to main branch (this triggers deployment)
git push origin main
```

### 5️⃣ Monitor Deployment

1. Go to GitHub repository → **Actions** tab
2. Watch the "Deploy to Firebase Hosting" workflow
3. Once complete, your app is live! 🎉

## 🌐 Your App URLs

After deployment, access your app at:
- `https://YOUR_PROJECT_ID.web.app`
- `https://YOUR_PROJECT_ID.firebaseapp.com`

## 🔧 Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build the Angular app
cd webapp
npm run build

# Deploy to Firebase (from project root)
cd ..
firebase deploy
```

## 📋 What Gets Deployed

- ✅ Angular web application (Hosting)
- ✅ Firestore security rules
- ✅ Firestore indexes
- ✅ Cloud Functions (notifications)

## 🎯 Workflow Triggers

Automatic deployment occurs when:
- ✅ Code is pushed to `main` branch
- ✅ Pull request is merged to `main`
- ✅ Manual trigger from Actions tab

## 🛠️ Troubleshooting

### Build fails?
- Check Node.js version (should be 20)
- Verify all dependencies in package.json
- Review build logs in Actions tab

### Deployment fails?
- Verify GitHub secrets are correct
- Check Firebase service account permissions
- Ensure firebase.json paths are correct

### Can't see changes?
- Hard refresh browser (Ctrl+F5)
- Clear browser cache
- Check deployment completed successfully in Actions

## 📚 Detailed Documentation

For detailed setup instructions, see [GITHUB_DEPLOYMENT_SETUP.md](GITHUB_DEPLOYMENT_SETUP.md)

## ⚡ Quick Commands

```bash
# Local development
cd webapp && npm start

# Build production
cd webapp && npm run build

# Deploy manually
firebase deploy

# View deployment
firebase open hosting:site
```

---

**Need Help?** Check the Actions logs for detailed error messages.
