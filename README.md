# Habit Tracker — Development Setup

This repo contains the docs and the starter scaffolding to build the Angular PWA + Firebase backend.

## Prerequisites
- Node.js 18+
- npm 9+
- Firebase CLI: `npm i -g firebase-tools`
- Angular CLI: `npm i -g @angular/cli`

## Create Angular App (webapp)
```powershell
cd "c:\RocheProjects\HabitTracker";
ng new webapp --routing --style=scss;
cd webapp;
ng add @angular/pwa;
ng add @angular/fire;
```

When prompted by `@angular/fire`, provide your Firebase project config.

## Firebase Project Setup
```powershell
firebase login;
firebase init firestore hosting functions;
```
- Firestore: start in test mode; replace rules with `firestore.rules` from this repo
- Hosting: use `webapp/dist/webapp` (after Angular build)
- Functions: JavaScript, Node 18

## Build and Deploy
```powershell
cd "c:\RocheProjects\HabitTracker\webapp";
npm run build -- --configuration production;
cd "c:\RocheProjects\HabitTracker";
firebase deploy;
```

## Cloud Functions (Notifications)
- The function checks `notifications` collection for entries matching current day/time
- Sends push via FCM to users with `fcmToken`

## Next Steps
- Implement service interfaces for provider-agnostic architecture
- Build Admin pages: Goals, Tasks, Notifications
- Build User pages: Dashboard, Daily Entry, Calendar
