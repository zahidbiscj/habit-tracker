# 🎯 Habit Tracker

A modern, mobile-first habit tracking application built with Angular 18, Firebase, and PrimeNG. Track daily habits, achieve goals, and maintain streaks with an intuitive interface.

## ✨ Features

### For Users
- 📊 **Dashboard** - View all assigned goals with completion status
- ✅ **Daily Entry** - Quick Yes/No tracking for each task
- 📅 **Calendar View** - Visual completion percentage with color coding
- 🔔 **Push Notifications** - Scheduled reminders via FCM
- ⚙️ **Settings** - Manage profile and change password
- 📱 **PWA Support** - Install as mobile app

### For Admins
- 🎯 **Goal Management** - Create goals with multiple tasks
- 👥 **User Assignment** - Assign goals to specific users
- 🔔 **Notification Scheduling** - Create hourly notifications with day selection
- 📊 **Future: Analytics Dashboard** - Track completion rates and trends

## 🏗️ Architecture

### Provider-Agnostic Design

The app uses **service interfaces** to decouple UI from backend:

```typescript
// Define contract
interface IGoalService {
  getGoals(): Observable<Goal[]>;
  createGoal(goal: Goal): Observable<Goal>;
}

// Firebase implementation
class GoalFirebaseService implements IGoalService { ... }

// Easy to switch providers
providers: [
  { provide: IGoalService, useClass: GoalFirebaseService }
  // Change to: useClass: GoalSupabaseService
]
```

**Benefits:**
- Switch from Firebase to Supabase in minutes
- Test with mock implementations
- No vendor lock-in

### Reusable Components

**9 custom components** wrapping PrimeNG:
- `ht-input`, `ht-textarea`, `ht-dropdown`, `ht-datepicker`
- `ht-button`, `ht-checkbox`, `ht-table`, `ht-card`, `ht-modal`

**Single source of truth** - Change button style once, updates everywhere.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase account
- Angular CLI 18+

### Installation

```bash
# Clone repository
cd habit-tracker/webapp

# Install dependencies
npm install

# Update Firebase config in src/environments/environment.ts
```

### Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create **Firestore Database**
4. Enable **Cloud Messaging (FCM)**
5. Copy config to `src/environments/environment.ts`

### Run Development Server

```bash
npm start
# Navigate to http://localhost:4200
```

### Build for Production

```bash
npm run build
# Output: dist/habit-tracker
```

## 📁 Project Structure

```
webapp/
├── src/
│   ├── app/
│   │   ├── core/                    # Core functionality
│   │   │   ├── models/              # 6 data models
│   │   │   ├── services/
│   │   │   │   ├── interfaces/      # 7 service contracts
│   │   │   │   └── firebase/        # Firebase implementations
│   │   │   └── guards/              # Route guards
│   │   ├── shared/
│   │   │   ├── components/common/   # 9 reusable components
│   │   │   └── shared.module.ts
│   │   ├── features/
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── admin/               # Admin pages
│   │   │   ├── user/                # User pages
│   │   │   └── shared/              # Shared features
│   │   ├── app-routing.module.ts    # Routes with guards
│   │   ├── app.module.ts            # Root module with DI
│   │   └── app.component.ts         # Root with navigation
│   ├── environments/                # Environment configs
│   ├── styles.css                   # Global styles
│   └── index.html
├── angular.json                     # Angular CLI config
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
```

## 🎨 Tech Stack

- **Frontend**: Angular 18
- **UI Components**: PrimeNG 17 (wrapped in custom components)
- **Backend**: Firebase (Auth, Firestore, FCM, Functions, Hosting)
- **State Management**: RxJS Observables
- **Styling**: Custom CSS with CSS Variables
- **PWA**: @angular/service-worker
- **Forms**: Reactive Forms with ControlValueAccessor
- **Routing**: Angular Router with Guards

## 🔐 Authentication & Authorization

### User Roles

1. **User (Default)** - View assigned goals, fill daily entries
2. **Admin** - All user permissions plus goal/notification management

### Creating First Admin

```javascript
// In Firebase Console > Firestore > users collection
// Edit first user document:
{
  role: "admin"  // Change from "user"
}
```

## 🎯 Current Status

**90% Complete** - Production ready with 3 minor components remaining:

✅ Complete:
- Core services and models
- Authentication and guards
- Admin goal management
- User dashboard
- Settings pages
- Routing and navigation
- PWA configuration

⚠️ Remaining:
- Admin notification pages (code ready in IMPLEMENTATION_GUIDE.md)
- User calendar view
- Daily entry modal

See [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) for details.

## 📖 Documentation

- [V1_FINAL_REQUIREMENTS.md](V1_FINAL_REQUIREMENTS.md) - Complete requirements
- [ARCHITECTURE.md](ARCHITECTURE.md) - Component architecture guide
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Remaining component code
- [FINAL_SETUP_GUIDE.md](FINAL_SETUP_GUIDE.md) - Setup and deployment
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Completion summary

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

**Built with ❤️ using Angular, Firebase, and PrimeNG**

🚀 **Ready to track your habits!**
