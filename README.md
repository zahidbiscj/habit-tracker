# Habit Tracker — Angular PWA + Firebase

A habit tracking web application where admins create goals/tasks and users track their daily completion. Built as an Angular PWA with Firebase backend.

## 🚀 Quick Start

### For Deployment
See [DEPLOY.md](DEPLOY.md) for quick deployment guide or [GITHUB_DEPLOYMENT_SETUP.md](GITHUB_DEPLOYMENT_SETUP.md) for detailed instructions.

### For Development

## Prerequisites
- Node.js 20+
- npm 9+
- Firebase CLI: `npm i -g firebase-tools`
- Angular CLI: `npm i -g @angular/cli`

## Local Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd habit-tracker
```

2. **Install dependencies**
```bash
cd webapp
npm install
```

3. **Configure Firebase**
Update `webapp/src/environments/environment.ts` with your Firebase config

4. **Run development server**
```bash
npm start
# App runs at http://localhost:4200
```

## 🏗️ Project Structure

```
habit-tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── functions/                  # Firebase Cloud Functions
│   ├── index.js               # Notification scheduler
│   └── package.json
├── webapp/                     # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Services, models, guards
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── admin/     # Admin pages
│   │   │   │   ├── auth/      # Login/Register
│   │   │   │   └── user/      # User dashboard, calendar
│   │   │   └── shared/        # Shared components
│   │   └── environments/      # Environment configs
│   └── package.json
├── firebase.json              # Firebase configuration
├── firestore.rules           # Firestore security rules
└── firestore.indexes.json    # Firestore indexes
```

## 🎯 Features

### Admin Features
- ✅ Create and manage goals with tasks
- ✅ Assign goals to users
- ✅ Create scheduled notifications
- ✅ View calendar and progress
- ✅ Manage user assignments

### User Features
- ✅ View assigned goals on dashboard
- ✅ Fill daily task entries
- ✅ Calendar view with completion tracking
- ✅ Color-coded progress visualization
- ✅ Monthly progress reports

### Technical Features
- ✅ Progressive Web App (PWA)
- ✅ Offline support
- ✅ Firebase Authentication
- ✅ Firestore database
- ✅ Cloud Functions for notifications
- ✅ Automatic deployment via GitHub Actions

## 📦 Build and Deploy

### Manual Deployment
```bash
# Build Angular app
cd webapp
npm run build -- --configuration production

# Deploy to Firebase
cd ..
firebase deploy
```

### Automatic Deployment (Recommended)
Push to `main` branch and GitHub Actions will automatically:
1. Build the Angular application
2. Install Cloud Functions dependencies
3. Deploy everything to Firebase Hosting

See [DEPLOY.md](DEPLOY.md) for setup instructions.

## 🔧 Development Commands

```bash
# Start development server
cd webapp && npm start

# Build for production
cd webapp && npm run build

# Run tests
cd webapp && npm test

# Lint code
cd webapp && npm run lint

# Deploy to Firebase
firebase deploy

# View Firebase logs
firebase functions:log
```

## 🗄️ Database Schema

- **users** - User profiles and FCM tokens
- **goals** - Goal definitions with date ranges
- **tasks** - Tasks belonging to goals
- **goalAssignments** - User-goal assignments
- **dailyLogs** - Daily task completion records
- **notifications** - Scheduled notification configurations

## 🔐 Security

- Firestore security rules enforce user permissions
- Admin-only access for goal/notification management
- Users can only view/edit their own data
- Service account keys managed via GitHub Secrets

## 🌐 Tech Stack

- **Frontend**: Angular 18, PrimeNG, Custom CSS
- **Backend**: Firebase (Firestore, Auth, Hosting, Functions)
- **CI/CD**: GitHub Actions
- **PWA**: Angular Service Worker

## 📝 Environment Configuration

Create environment files:

**Development** (`webapp/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

**Production** (`webapp/src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  firebase: {
    // Same config as above
  }
};
```

## Cloud Functions (Notifications)
- Hourly function checks `notifications` collection
- Matches current day/time against scheduled notifications
- Sends push notifications via FCM to users with `fcmToken`
- Timezone: Asia/Dhaka (UTC+6)

## 🚀 Deployment URLs

After deployment, your app will be available at:
- `https://YOUR_PROJECT_ID.web.app`
- `https://YOUR_PROJECT_ID.firebaseapp.com`

## 📚 Documentation

- [DEPLOY.md](DEPLOY.md) - Quick deployment guide
- [GITHUB_DEPLOYMENT_SETUP.md](GITHUB_DEPLOYMENT_SETUP.md) - Detailed setup instructions
- [V1_FINAL_REQUIREMENTS.md](V1_FINAL_REQUIREMENTS.md) - Complete feature specifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Create a pull request

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions:
1. Check the GitHub Actions logs
2. Review Firebase Console logs
3. Check Firestore security rules
4. Verify environment configuration

---

**Last Updated**: December 22, 2025
