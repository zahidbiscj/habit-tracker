# Habit Tracker App - Final V1 Requirements

**Goal:** The codebase must be loosely coupled and provider-agnostic, so the backend (Firebase, Supabase, REST API, etc.) can be swapped with minimal changes to the UI/business logic.

### Key Principles
- **Abstraction Layer:**
  - All data access (CRUD for users, goals, tasks, logs, assignments) must go through Angular service interfaces (e.g., `GoalService`, `UserService`, `TaskService`, `DailyLogService`).
  - UI components never call Firebase SDK directly; they use these services.
  - Each service implements a generic interface (e.g., `IGoalService`) that can have multiple implementations (Firebase, REST, etc.).
- **Dependency Injection:**
  - Use Angular’s DI to inject the current provider’s implementation.
  - Switching providers is as simple as changing the provider in `app.module.ts`.
- **No Tight Coupling:**
  - No Firebase-specific code in UI/components.
  - No direct use of Firestore/Realtime Database/FCM in business logic.
- **DTOs/Models:**
  - Use TypeScript interfaces/classes for all entities (User, Goal, Task, etc.).
  - Map backend data to these models in the service layer.
- **Provider-Agnostic Notifications:**
  - Notification logic (push, reminders) should be abstracted behind a `NotificationService` interface.
  - Implementation can use FCM, OneSignal, or any other provider.
- **Testing & Mocking:**
  - Use mock service implementations for unit testing and local development.

### Example Service Abstraction
```typescript
// goal.service.interface.ts
export interface IGoalService {
  getGoalsForUser(userId: string): Observable<Goal[]>;
  createGoal(goal: Goal): Observable<Goal>;
  updateGoal(goal: Goal): Observable<void>;
  deleteGoal(goalId: string): Observable<void>;
}

// goal.firebase.service.ts
@Injectable({ providedIn: 'root' })
export class GoalFirebaseService implements IGoalService {
  // ...Firebase implementation
}

// goal.supabase.service.ts
@Injectable({ providedIn: 'root' })
export class GoalSupabaseService implements IGoalService {
  // ...Supabase implementation
}

// app.module.ts
providers: [
  { provide: IGoalService, useClass: GoalFirebaseService },
]
```

### Benefits
- You can switch from Firebase to Supabase, REST API, or any other backend by:
  - Implementing the service interfaces for the new provider
  - Changing the provider in Angular’s DI
- UI and business logic remain unchanged
- Easier testing, maintenance, and future-proofing

---
---

## Overview
A simple habit tracking web application where admins create goals/tasks and users track their daily completion. Built as an Angular PWA with Firebase backend for zero-cost hosting and deployment.

---

## Tech Stack
- **Frontend**: Angular 18+ with PWA support
- **UI Components**: PrimeNG (tables, forms, components)
- **Styling**: Custom CSS only (mobile-first design)
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **Deployment**: GitHub Actions → Firebase Hosting
- **Notifications**: Firebase Cloud Messaging (Web Push)
- **Offline Support**: Service Worker + Firestore offline persistence
- **Timezone**: Asia/Dhaka (UTC+6)

---

## Database Schema

### User
| Field        | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | string    | Unique user ID (Firebase Auth UID)  |
| name         | string    | User's full name                     |
| email        | string    | User's email address                 |
| role         | string    | 'admin' or 'user'                    |
| fcmToken     | string    | Firebase Cloud Messaging token (nullable) |
| active       | boolean   | Whether user is active               |
| createdDate  | timestamp | When user was created                |
| updatedDate  | timestamp | Last update timestamp                |
| createdBy    | string    | User ID who created this record      |
| updatedBy    | string    | User ID who last updated this record |

### Goal
| Field        | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | string    | Unique goal ID                       |
| name         | string    | Goal name                            |
| description  | string    | Goal description                     |
| startDate    | date      | Goal start date                      |
| endDate      | date      | Goal end date (nullable)             |
| active       | boolean   | Whether goal is active               |
| createdDate  | timestamp | When goal was created                |
| updatedDate  | timestamp | Last update timestamp                |
| createdBy    | string    | User ID who created this goal        |
| updatedBy    | string    | User ID who last updated this goal   |

### Task
| Field           | Type      | Description                          |
|-----------------|-----------|--------------------------------------|
| id              | string    | Unique task ID                       |
| goalId          | string    | Foreign key to Goal                  |
| name            | string    | Task name                            |
| type            | string    | 'boolean' (Yes/No)                   |
| additionalNotes | string    | Optional notes (e.g., time, context) |
| position        | number    | Display order within goal            |
| active          | boolean   | Whether task is active               |
| createdDate     | timestamp | When task was created                |
| updatedDate     | timestamp | Last update timestamp                |
| createdBy       | string    | User ID who created this task        |
| updatedBy       | string    | User ID who last updated this task   |

### GoalAssignment
| Field        | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| goalId       | string    | Foreign key to Goal                  |
| userId       | string    | Foreign key to User                  |
| active       | boolean   | Whether assignment is active         |
| createdDate  | timestamp | When assignment was created          |
| updatedDate  | timestamp | Last update timestamp                |
| createdBy    | string    | User ID who created this assignment  |
| updatedBy    | string    | User ID who last updated             |

**Primary Key**: (goalId, userId)

### DailyLog
| Field        | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | string    | Unique log entry ID                  |
| date         | date      | Date of the log entry (YYYY-MM-DD)   |
| taskId       | string    | Foreign key to Task                  |
| userId       | string    | Foreign key to User                  |
| value        | boolean   | Yes (true) or No (false)             |
| active       | boolean   | Whether log entry is active          |
| createdDate  | timestamp | When log was created                 |
| updatedDate  | timestamp | Last update timestamp                |
| createdBy    | string    | User ID who created this log         |
| updatedBy    | string    | User ID who last updated this log    |

**Composite Index**: (userId, date, taskId) for fast queries

### Notification
| Field        | Type      | Description                                    |
|--------------|-----------|------------------------------------------------|
| id           | string    | Unique notification ID                         |
| title        | string    | Notification title                             |
| body         | string    | Notification message body                      |
| time         | string    | Time to send (HH:mm format, e.g., "21:00")     |
| daysOfWeek   | array     | Array of day numbers (0=Sun, 1=Mon, ..., 6=Sat)|
| active       | boolean   | Whether notification is active                 |
| createdDate  | timestamp | When notification was created                  |
| updatedDate  | timestamp | Last update timestamp                          |
| createdBy    | string    | User ID who created this notification          |
| updatedBy    | string    | User ID who last updated this notification     |

**Example**: Send "Daily Reminder" at 9 PM on Mon, Wed, Fri would have:
- `time`: "21:00"
- `daysOfWeek`: [1, 3, 5]

---

## User Roles & Permissions

### Admin
- Full CRUD on Goals and Tasks
- Assign/unassign goals to users
- View all users and their progress
- Access admin sidebar with Goals management

### User
- View only assigned goals
- Fill daily entry form for assigned tasks
- View personal dashboard and calendar
- Cannot create, edit, or delete goals/tasks

---

## Authentication Flow

### Registration (All Users)
**Page**: `/register`

**UI**:
```
┌─────────────────────────────────────────────┐
│          Habit Tracker - Register           │
├─────────────────────────────────────────────┤
│                                              │
│  Name:  [_____________________________]     │
│                                              │
│  Email: [_____________________________]     │
│                                              │
│  Password: [_________________________]      │
│                                              │
│  Confirm Password: [_________________]      │
│                                              │
│         [Register]  [Back to Login]         │
│                                              │
└─────────────────────────────────────────────┘
```

**Flow**:
1. User enters name, email, password
2. System validates:
   - Email format is valid
   - Passwords match
3. System creates Firebase Auth user
4. System creates User document in Firestore with role='user' (default)
5. User is redirected to `/user/dashboard`
6. **Note**: First registered user and all subsequent users start as 'user' role. Admin must manually promote users to 'admin' role via Firebase Console or admin panel (future feature)

**Sample JSON (User document created in Firestore)**:
```json
{
  "id": "abc123xyz",
  "name": "Ahmad Khan",
  "email": "ahmad@email.com",
  "role": "user",
  "active": true,
  "createdDate": "2025-12-18T10:00:00Z",
  "updatedDate": "2025-12-18T10:00:00Z",
  "createdBy": "abc123xyz",
  "updatedBy": "abc123xyz"
}
```

---

### Login
**Page**: `/login`

**UI**:
```
┌─────────────────────────────────────────────┐
│           Habit Tracker - Login             │
├─────────────────────────────────────────────┤
│                                              │
│  Email:    [_____________________________]  │
│                                              │
│  Password: [_____________________________]  │
│                                              │
│         [Login]  [Register]                 │
│                                              │
└─────────────────────────────────────────────┘
```

**Flow**:
1. User enters email and password
2. System authenticates via Firebase Auth
3. System fetches user document from Firestore
4. User is redirected based on role:
   - Admin → `/admin/goals`
   - User → `/user/dashboard`

---

## Admin Pages & Flows

### Admin Sidebar Navigation
```
┌──────────────────┐
│  Habit Tracker   │
├──────────────────┤
│  📊 Dashboard    │
│  🎯 Goals        │
│  🔔 Notifications│
│  👤 Settings     │
│  🚪 Logout       │
└──────────────────┘
```

---

### 1. Goals List Page
**Route**: `/admin/goals`

**UI**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Goals Management                          [+ Create New Goal]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Goal: On Time Salah                    [Edit] [Delete]   │  │
│  │ Description: Complete all 5 daily prayers on time        │  │
│  │ Period: 2025-12-01 to 2025-12-31                         │  │
│  │ Status: Active                                           │  │
│  │ Tasks: 5 tasks | Assigned to: 3 users                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Goal: 10 Minute Quran                  [Edit] [Delete]   │  │
│  │ Description: Recite Quran for 10 minutes each day        │  │
│  │ Period: 2025-12-01 to 2025-12-31                         │  │
│  │ Status: Active                                           │  │
│  │ Tasks: 1 task | Assigned to: 2 users                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Flow**:
1. Admin lands on this page after login
2. System fetches all goals from Firestore
3. Each goal card shows summary info
4. Admin can:
   - Click "Create New Goal" → Navigate to Create Goal page
   - Click "Edit" → Navigate to Edit Goal page with pre-filled data
   - Click "Delete" → Show confirmation dialog, then soft-delete (set active=false)

---

### 2. Create Goal Page
**Route**: `/admin/goals/create`

**UI**:
```
┌─────────────────────────────────────────────────────────┐
│ ← Cancel | Create New Goal                   [Save]     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📅 Select Goal Period                                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ← December 2025 →                                  │ │
│ │ Sun  Mon  Tue  Wed  Thu  Fri  Sat                 │ │
│ │  1    2    3    4    5    6    7                  │ │
│ │  8    9   10   11   12   13   14                  │ │
│ │ 15   16   17   18   19   20   21                  │ │
│ │ 22   23   24   25   26   27   28                  │ │
│ │ 29   30   31                                       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Goals on Dec 15 ────────────────────────────────┐   │
│ │ 1. On Time Salah (Dec 1-31)                      │   │
│ │ 2. 10 Minute Quran (Dec 10-20)                   │   │
│ │ ... [View All 5 Goals] ←────────────────────────┐│   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ Instructions: Click to select start date, then click    │
│ another date to select end date. Click any date to      │
│ view first 2 goals. Click 'View All' for complete list. │
│                                                          │
│ Goal Name *                                             │
│ [_______________________________________________]        │
│                                                          │
│ Description                                             │
│ [_______________________________________________]        │
│ [_______________________________________________]        │
│                                                          │
│ Start Date * (Auto-filled from calendar)                │
│ [📅 2025-12-08] (Read-only)                            │
│                                                          │
│ End Date (Auto-filled from calendar)                    │
│ [📅 2025-12-22] (Read-only)                            │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Tasks (Manual Entry) *                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Task 1                                          │    │
│ │ Name: [Fajr Prayer___________________]         │    │
│ │ Notes: [5:30 AM_____________________]          │    │
│ │ [Remove]                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Task 2                                          │    │
│ │ Name: [Dhuhr Prayer__________________]         │    │
│ │ Notes: [1:00 PM_____________________]          │    │
│ │ [Remove]                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [+ Add Another Task]                                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Assign to Users *                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [✓] Select All                                          │
│ [ ] Ahmad (ahmad@email.com)                             │
│ [✓] Fatima (fatima@email.com)                           │
│ [ ] Ibrahim (ibrahim@email.com)                         │
│                                                          │
│         [Cancel]           [Save & Assign Goal]         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Calendar Features**:
- **Month Navigation**: Use ← → arrows to navigate between months
- **Date Range Selection**: 
  - First click = Start Date
  - Second click = End Date
  - No visual highlighting on calendar
- **View Existing Goals**: 
  - Click any date to see first 2 goals for that day (shown below calendar)
  - Display format: "Goal Name (Start Date - End Date)"
  - If more than 2 goals exist, shows "... [View All X Goals]"
  - Clicking "View All" opens a modal with complete goals list and their tasks
- **Goals Preview Modal**: 
  - Shows all goals active on selected date
  - Each goal displays: Name, Date Range, and all tasks
  - Helps admin avoid scheduling conflicts or overlaps
- **Auto-fill**: Start/End Date fields automatically update when dates selected on calendar
- **Read-only Fields**: Date fields cannot be manually edited, only via calendar selection

**Field Purposes**:
- **Goal Name**: Primary identifier for the goal
- **Description**: Context and motivation for users
- **Start Date**: Auto-filled from calendar selection, when the goal becomes active
- **End Date**: Auto-filled from calendar selection; optional (if not selected, goal runs indefinitely)
- **Tasks**: Individual items users must complete daily
  - **Name**: What the user needs to do
  - **Notes**: Optional context (time, location, etc.)
- **Assign to Users**: Which users will see and track this goal

**Validation**:
- Goal Name: Required, max 100 chars
- Start Date: Required, cannot be in the past
- End Date: Optional, must be after Start Date
- Tasks: At least 1 task required
- Users: At least 1 user must be assigned

**Goals Preview Modal** (When clicking "View All"):
```
┌─────────────────────────────────────────────────────────┐
│ ✕ | Goals on December 15, 2025                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 1. On Time Salah (Dec 1-31, 2025)                       │
│    Tasks: Fajr, Dhuhr, Asr, Maghrib, Isha (5 tasks)     │
│                                                          │
│ 2. 10 Minute Quran (Dec 10-20, 2025)                    │
│    Tasks: 10 Min Recitation (1 task)                    │
│                                                          │
│ 3. English Practice (Dec 5-30, 2025)                    │
│    Tasks: Speaking, Listening (2 tasks)                 │
│                                                          │
│ 4. Gym Workout (Dec 1-31, 2025)                         │
│    Tasks: Cardio, Strength, Stretching (3 tasks)        │
│                                                          │
│ 5. Morning Routine (Dec 1-31, 2025)                     │
│    Tasks: Wake up early, Exercise (2 tasks)             │
│                                                          │
│                          [Close]                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Flow**:
1. Admin lands on page, calendar shows current month
2. Admin can navigate to previous/next months using arrow buttons
3. Admin can click any date to view first 2 goals for that day (shown below calendar)
4. If more than 2 goals exist, admin can click "View All" to open modal with complete list
5. Modal shows all goals and their tasks for the selected date
6. Admin closes modal and proceeds with date selection
7. Admin clicks a date on calendar to select start date
8. Admin clicks another date to select end date
9. Start Date and End Date fields auto-populate (read-only)
10. Admin can reselect dates on calendar to change range
11. Admin fills Goal Name and Description
12. Admin clicks "Add Another Task" to add more tasks (no limit)
13. Admin clicks "Remove" to delete a task
14. Admin selects users to assign
15. Admin clicks "Save & Assign Goal"
6. System validates all fields
7. System creates Goal document
8. System creates Task documents (one per task)
9. System creates GoalAssignment documents (one per selected user)
10. Admin is redirected to Goals List page
11. Success message: "Goal created and assigned successfully!"

**Sample JSON After Save**:

**Goal Document** (`goals/{goalId}`):
```json
{
  "id": "goal_001",
  "name": "On Time Salah",
  "description": "Complete all 5 daily prayers on time",
  "startDate": "2025-12-18",
  "endDate": "2025-12-31",
  "active": true,
  "createdDate": "2025-12-18T14:30:00Z",
  "updatedDate": "2025-12-18T14:30:00Z",
  "createdBy": "admin_user_id",
  "updatedBy": "admin_user_id"
}
```

**Task Documents** (`tasks/{taskId}`):
```json
[
  {
    "id": "task_001",
    "goalId": "goal_001",
    "name": "Fajr Prayer",
    "type": "boolean",
    "additionalNotes": "5:30 AM",
    "position": 1,
    "active": true,
    "createdDate": "2025-12-18T14:30:00Z",
    "updatedDate": "2025-12-18T14:30:00Z",
    "createdBy": "admin_user_id",
    "updatedBy": "admin_user_id"
  },
  {
    "id": "task_002",
    "goalId": "goal_001",
    "name": "Dhuhr Prayer",
    "type": "boolean",
    "additionalNotes": "1:00 PM",
    "position": 2,
    "active": true,
    "createdDate": "2025-12-18T14:30:00Z",
    "updatedDate": "2025-12-18T14:30:00Z",
    "createdBy": "admin_user_id",
    "updatedBy": "admin_user_id"
  }
]
```

**GoalAssignment Documents** (`goalAssignments/{assignmentId}`):
```json
[
  {
    "goalId": "goal_001",
    "userId": "user_fatima_id",
    "active": true,
    "createdDate": "2025-12-18T14:30:00Z",
    "updatedDate": "2025-12-18T14:30:00Z",
    "createdBy": "admin_user_id",
    "updatedBy": "admin_user_id"
  }
]
```

---

### 3. Edit Goal Page
**Route**: `/admin/goals/edit/:goalId`

**UI**: Same as Create Goal page, but pre-filled with existing data

**Flow**:
1. Admin clicks "Edit" on Goals List page
2. System fetches Goal, Tasks, and GoalAssignments
3. Form is pre-populated including calendar showing the current month
4. Start Date and End Date fields show existing values
5. Admin can change date range by clicking on calendar
6. Admin can click any date to view existing goals for that day
7. Admin makes changes to other fields
8. Admin clicks "Save & Assign Goal"
9. System updates Goal, Tasks, and GoalAssignments
10. Admin is redirected to Goals List page
11. Success message: "Goal updated successfully!"

**Note**: Calendar does not highlight date ranges; admin clicks dates to select new range if needed

**Note**: If admin removes a task that has existing DailyLog entries, those entries remain in the database (for historical tracking) but are no longer shown to users.

---

### 4. Notifications List Page
**Route**: `/admin/notifications`

**UI**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Notifications Management              [+ Create Notification]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔔 Daily Reminder                   [Edit] [Delete]      │  │
│  │ "Don't forget to fill your daily habits!"                │  │
│  │ Time: 9:00 PM | Days: Mon, Wed, Fri                      │  │
│  │ Status: Active                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔔 Morning Motivation               [Edit] [Delete]      │  │
│  │ "Start your day with good habits!"                       │  │
│  │ Time: 7:00 AM | Days: Everyday                           │  │
│  │ Status: Active                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Flow**:
1. Admin clicks "Notifications" in sidebar
2. System fetches all notifications from Firestore
3. Each notification card shows: title, body preview, time, days, status
4. Admin can:
   - Click "Create Notification" → Navigate to Create Notification page
   - Click "Edit" → Navigate to Edit Notification page
   - Click "Delete" → Soft delete (set active=false)

---

### 5. Create Notification Page
**Route**: `/admin/notifications/create`

**UI**:
```
┌─────────────────────────────────────────────────────────────┐
│  Create New Notification                         [Cancel]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Title: [_____________________________________________]      │
│                                                              │
│  Message:                                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │                                                        │ │
│  │                                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Time: [__:__] (24-hour format, e.g., 21:00)                │
│                                                              │
│  Days of Week:                                               │
│  [ ] Sunday    [ ] Monday    [ ] Tuesday                     │
│  [ ] Wednesday [ ] Thursday  [ ] Friday                      │
│  [ ] Saturday                                                │
│                                                              │
│  Status: [x] Active                                          │
│                                                              │
│           [Save Notification]  [Cancel]                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Validation Rules**:
- Title: Required, max 100 characters
- Message: Required, max 500 characters
- Time: Required, valid HH:mm format (00:00 to 23:59)
- Days: At least one day must be selected

**Flow**:
1. Admin clicks "Create Notification" from Notifications List
2. Admin fills in title, message, time, and selects days
3. Admin clicks "Save Notification"
4. System validates all fields
5. System creates Notification document in Firestore
6. Admin is redirected to Notifications List page
7. Success message: "Notification created successfully!"

**Sample JSON After Save**:

**Notification Document** (`notifications/{notificationId}`):
```json
{
  "id": "notif_001",
  "title": "Daily Reminder",
  "body": "Don't forget to fill your daily habits!",
  "time": "21:00",
  "daysOfWeek": [1, 3, 5],
  "active": true,
  "createdDate": "2025-12-18T15:00:00Z",
  "updatedDate": "2025-12-18T15:00:00Z",
  "createdBy": "admin_user_id",
  "updatedBy": "admin_user_id"
}
```

**Days Mapping**:
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

---

### 6. Edit Notification Page
**Route**: `/admin/notifications/edit/:notificationId`

**UI**: Same as Create Notification page, but pre-filled with existing data

**Flow**:
1. Admin clicks "Edit" on Notifications List page
2. System fetches Notification document
3. Form is pre-populated
4. Admin makes changes
5. Admin clicks "Save Notification"
6. System updates Notification document
7. Admin is redirected to Notifications List page
8. Success message: "Notification updated successfully!"

---

### 7. Settings Page
**Route**: `/admin/settings`

**UI**:
```
┌─────────────────────────────────────────────────────────┐
│  Settings                                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Profile Information                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  Name:  [_____________________________] [Update Name]   │
│                                                          │
│  Email: [_____________________________] [Update Email]  │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  Change Password                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  Current Password: [_________________________]          │
│                                                          │
│  New Password:     [_________________________]          │
│                                                          │
│  Confirm Password: [_________________________]          │
│                                                          │
│               [Change Password]                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- **Update Name**: Change display name (updates Firestore User document)
- **Update Email**: Change email address (updates Firebase Auth and Firestore)
- **Change Password**: Requires current password for security

**Validation**:
- Name: Required, max 100 chars
- Email: Valid email format, unique
- Current Password: Required for password change
- New Password: Min 6 chars, must match confirm password

**Flow (Update Name)**:
1. Admin enters new name
2. Admin clicks "Update Name"
3. System updates User document in Firestore
4. Success message: "Name updated successfully!"

**Flow (Update Email)**:
1. Admin enters new email
2. Admin clicks "Update Email"
3. System updates Firebase Auth email
4. System updates User document in Firestore
5. Success message: "Email updated successfully!"

**Flow (Change Password)**:
1. Admin enters current password, new password, and confirmation
2. Admin clicks "Change Password"
3. System validates current password
4. System updates password in Firebase Auth
5. Success message: "Password changed successfully!"
6. Form clears password fields

---

## User Pages & Flows

### User Navigation (Bottom Nav)
```
┌─────────────────────────────────────────────┐
│  [🏠 Home]  [📅 Calendar]  [⚙️ Settings]   │
└─────────────────────────────────────────────┘
```

**Note**: Mobile-first design - navigation, forms, and all UI optimized for mobile devices first, then responsive for desktop

---

### 1. Dashboard Page
**Route**: `/user/dashboard`

**UI**:
```
┌─────────────────────────────────────────────────────────┐
│ Habit Tracker                       👤 Ahmad | Logout   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Month: [📅 December 2025 ▼]                            │
│ Wednesday, December 18, 2025                            │
│ < Previous Day | Today | Next Day >                     │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 🕌 On Time Salah       │ │ 📖 10 Minute Quran     │  │
│ │ Today: 3/5 completed   │ │ Today: Not filled      │  │
│ │ - Fajr ✓               │ │ - 10 Min Recitation ⏰ │  │
│ │ - Dhuhr ✓              │ │                        │  │
│ │ - Asr ✓                │ │                        │  │
│ │ - Maghrib ⏰           │ │                        │  │
│ │ - Isha ⏰              │ │                        │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 📚 English Practice    │ │ 💪 Gym Workout         │  │
│ │ Today: Completed       │ │ Today: Not filled      │  │
│ │ - Speaking ✓           │ │ - Cardio ⏰            │  │
│ │ - Listening ✓          │ │ - Strength ⏰          │  │
│ │                        │ │ - Stretching ⏰        │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│              [📝 Fill Today's Entry]                    │
│                                                          │
│ Bottom Nav: [🏠 Home] [📅 Calendar] [⚙️ Settings]      │
└─────────────────────────────────────────────────────────┘
```

**Badge Status Indicators**:
- ✓ = Completed (Yes)
- ⏰ = Pending (Not filled yet)
- "Today: X/Y completed" = Task completion count
- "Today: Completed" = All tasks done
- "Today: Not filled" = No entry yet

**Month Selector Behavior**:
- **Current Month (Default)**: Shows only goals where current date is between startDate and endDate
- **Past/Future Month**: Shows all goals that have any overlap with the selected month, regardless of current date
- Example: Goal runs 1-7 Dec 2025. On 22 Jan 2026:
  - Dashboard (current month view): Goal NOT shown
  - Dashboard with December 2025 selected: Goal shown
  - Calendar view with December 2025: Goal shown

**Data Source**:
1. System fetches goals assigned to current user via GoalAssignments
2. Filter goals based on selected month and current date logic
3. For each goal, fetch associated tasks
4. For the selected date, fetch DailyLog entries for each task
5. Calculate completion status per goal

**Flow**:
1. User lands on this page after login
2. Badges display all assigned goals with today's status
3. User can navigate dates using Previous/Next Day
4. Badges are **view-only** (no click action)
5. User clicks "Fill Today's Entry" to open the daily entry form

**Query Logic** (Firestore):
```javascript
// Get assigned goals
goalAssignments.where('userId', '==', currentUserId)
  .where('active', '==', true)
  .get()

// For each goalId, get tasks
tasks.where('goalId', '==', goalId)
  .where('active', '==', true)
  .orderBy('position')
  .get()

// For each task, get today's log
dailyLogs.where('userId', '==', currentUserId)
  .where('taskId', '==', taskId)
  .where('date', '==', selectedDate)
  .get()
```

---

### 2. Daily Entry Form
**Route**: `/user/daily-entry` (modal/overlay on dashboard)

**UI**:
```
┌───────────────────────────────────────────────────┐
│ ✕ | Daily Entry Form                              │
├───────────────────────────────────────────────────┤
│                                                    │
│ Select Date: [📅 December 18, 2025 ▼]             │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 1: On Time Salah                             │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Fajr Prayer (5:30 AM)    [●Yes  ○No]          │
│ 2. Dhuhr Prayer (1:00 PM)   [●Yes  ○No]          │
│ 3. Asr Prayer (4:30 PM)     [●Yes  ○No]          │
│ 4. Maghrib Prayer (6:45 PM) [○Yes  ●No]          │
│ 5. Isha Prayer (8:30 PM)    [○Yes  ●No]          │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 2: 10 Minute Quran                           │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. 10 Minute Recitation     [○Yes  ○No]          │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 3: English Practice                          │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Speaking Practice 5 min  [●Yes  ○No]          │
│ 2. Listening Practice 5 min [●Yes  ○No]          │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 4: Gym Workout                               │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Cardio 30 min            [○Yes  ○No]          │
│ 2. Strength Training        [○Yes  ○No]          │
│ 3. Stretching 10 min        [○Yes  ○No]          │
│                                                    │
├───────────────────────────────────────────────────┤
│                                                    │
│ 📊 Summary: 4 goals, 11 tasks                     │
│                                                    │
│        [Cancel]         [Save All Entries]        │
│                                                    │
└───────────────────────────────────────────────────┘
```

**Features**:
- **Date Selector**: User can fill entries for any past or current date (not future dates)
- **Scrollable**: Form scrolls vertically if many goals
- **Pre-filled**: If user has already filled this date, form shows existing selections
- **Single Submit**: One save button for all entries
- **Validation**: Cannot save if any task is left unanswered

**Flow**:
1. User clicks "Fill Today's Entry" from dashboard
2. Form opens as modal/overlay
3. Form is pre-populated with existing DailyLog entries (if any)
4. User selects Yes/No for each task
5. User clicks "Save All Entries"
6. System validates: all tasks answered
7. System creates/updates DailyLog entries (one per task)
8. Modal closes
9. Dashboard refreshes to show updated status
10. Success message: "Entries saved successfully!"

**Sample JSON After Save** (DailyLog documents):
```json
[
  {
    "id": "log_001",
    "date": "2025-12-18",
    "taskId": "task_001",
    "userId": "user_ahmad_id",
    "value": true,
    "active": true,
    "createdDate": "2025-12-18T22:00:00Z",
    "updatedDate": "2025-12-18T22:00:00Z",
    "createdBy": "user_ahmad_id",
    "updatedBy": "user_ahmad_id"
  },
  {
    "id": "log_002",
    "date": "2025-12-18",
    "taskId": "task_002",
    "userId": "user_ahmad_id",
    "value": true,
    "active": true,
    "createdDate": "2025-12-18T22:00:00Z",
    "updatedDate": "2025-12-18T22:00:00Z",
    "createdBy": "user_ahmad_id",
    "updatedBy": "user_ahmad_id"
  },
  {
    "id": "log_003",
    "date": "2025-12-18",
    "taskId": "task_003",
    "userId": "user_ahmad_id",
    "value": true,
    "active": true,
    "createdDate": "2025-12-18T22:00:00Z",
    "updatedDate": "2025-12-18T22:00:00Z",
    "createdBy": "user_ahmad_id",
    "updatedBy": "user_ahmad_id"
  },
  {
    "id": "log_004",
    "date": "2025-12-18",
    "taskId": "task_004",
    "userId": "user_ahmad_id",
    "value": false,
    "active": true,
    "createdDate": "2025-12-18T22:00:00Z",
    "updatedDate": "2025-12-18T22:00:00Z",
    "createdBy": "user_ahmad_id",
    "updatedBy": "user_ahmad_id"
  }
]
```

---

### 3. Calendar View Page
**Route**: `/user/calendar`

**UI**:
```
┌─────────────────────────────────────────────────────────┐
│ ← Prev Month | December 2025 | Next Month → | Today    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Sun   Mon   Tue   Wed   Thu   Fri   Sat               │
│   1     2     3     4     5     6     7                 │
│  80%   100%  60%   100%  80%   40%   100%               │
│  🟢    🟢    🟡    🟢    🟢    🟠    🟢                  │
│                                                          │
│   8     9    10    11    12    13    14                 │
│  100%  100%  80%   60%   100%  100%  40%                │
│  🟢    🟢    🟢    🟡    🟢    🟢    🟠                  │
│                                                          │
│  15    16    17   [18]   19    20    21                 │
│  100%  80%   90%  [75%]  --    --    --                 │
│  🟢    🟢    🟢   [🟡]   ⚪    ⚪    ⚪                  │
│                                                          │
│  22    23    24    25    26    27    28                 │
│  --    --    --    --    --    --    --                 │
│  ⚪    ⚪    ⚪    ⚪    ⚪    ⚪    ⚪                  │
│                                                          │
│  29    30    31                                          │
│  --    --    --                                          │
│  ⚪    ⚪    ⚪                                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Selected: December 18, 2025                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Daily Habits Completion:                                │
│                                                          │
│ ✓ On Time Salah (3/5 tasks)                             │
│ ✗ 10 Minute Quran (0/1 task)                            │
│ ✓ English Practice (2/2 tasks)                          │
│ ✗ Gym Workout (0/3 tasks)                               │
│                                                          │
│ Overall: 5/11 tasks completed (45%)                     │
│                                                          │
│ Legend:                                                 │
│ 🟢 80-100% | 🟡 60-79% | 🟠 40-59% | ⚪ No data         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- **Monthly View**: Shows completion percentage for each day
- **Color Coding**:
  - 🟢 Green: 80-100% completion
  - 🟡 Yellow: 60-79% completion
  - 🟠 Orange: 40-59% completion
  - 🔴 Red: 0-39% completion (if needed)
  - ⚪ Gray: No data (not filled)
- **Day Details**: Click any day to see breakdown by goal
- **Month Navigation**: 
  - ← Prev Month button: Navigate to previous month
  - Next Month → button: Navigate to next month
  - Today button: Jump back to current month
  - Can navigate to any past or future month
- **Current Day**: Highlighted with border in current month view
- **Goal Visibility**: Shows all goals that have any dates within the selected month

**Calculation Logic**:
```javascript
// For each date
totalTasks = count of all tasks assigned to user
completedTasks = count of DailyLog entries where value = true for that date
percentage = (completedTasks / totalTasks) * 100
```

**Flow**:
1. User navigates to Calendar page
2. System fetches all DailyLog entries for current user for the month
3. System calculates completion percentage for each day
4. Calendar displays color-coded days
5. User clicks a day to see detailed breakdown
6. Selected day's details appear at bottom

**Query Logic** (Firestore):
```javascript
// Get all logs for user in month range
dailyLogs.where('userId', '==', currentUserId)
  .where('date', '>=', monthStart)
  .where('date', '<=', monthEnd)
  .where('active', '==', true)
  .get()

// Group by date and calculate percentages
```

---

### 4. User Settings Page
**Route**: `/user/settings`

**UI**: Same as Admin Settings page (name, email, password change)

**Features**:
- Update display name
- Update email address
- Change password

**Flow**: Same as Admin Settings page

---

## Example Scenarios (MVP)

### Scenario 1: Admin Creates "On Time Salah" Goal

**Step-by-Step**:
1. Admin logs in → lands on `/admin/goals`
2. Admin clicks "Create New Goal"
3. **Calendar appears at top showing December 2025**
4. Admin clicks December 1 to set start date
5. Admin clicks December 31 to set end date
6. Start Date and End Date fields auto-populate with selected dates
7. Admin fills remaining form:
   - **Goal Name**: "On Time Salah"
   - **Description**: "Complete all 5 daily prayers on time"
   - **Tasks**:
     - Task 1: Name = "Fajr", Notes = "5:30 AM"
     - Task 2: Name = "Dhuhr", Notes = "1:00 PM"
     - Task 3: Name = "Asr", Notes = "4:30 PM"
     - Task 4: Name = "Maghrib", Notes = "6:45 PM"
     - Task 5: Name = "Isha", Notes = "8:30 PM"
   - **Assign to Users**: Selects Ahmad, Fatima, Ibrahim
8. Admin clicks "Save & Assign Goal"
9. System creates:
   - 1 Goal document
   - 5 Task documents
   - 3 GoalAssignment documents
10. Admin sees success message and is redirected to Goals List

**Result**:
- Goal "On Time Salah" appears in Goals List
- Ahmad, Fatima, and Ibrahim see this goal on their dashboards

---

### Scenario 2: User (Ahmad) Fills Daily Entry

**Step-by-Step**:
1. Ahmad logs in → lands on `/user/dashboard`
2. Dashboard shows 4 goal badges (On Time Salah, 10 Minute Quran, English Practice, Gym Workout)
3. Ahmad clicks "Fill Today's Entry"
4. Form opens with all 11 tasks
5. Ahmad selects:
   - Fajr: Yes
   - Dhuhr: Yes
   - Asr: Yes
   - Maghrib: No
   - Isha: No
   - 10 Minute Quran: No
   - Speaking: Yes
   - Listening: Yes
   - Cardio: No
   - Strength: No
   - Stretching: No
6. Ahmad clicks "Save All Entries"
7. System creates 11 DailyLog documents
8. Form closes, dashboard refreshes
9. Badges update to show completion status

**Result**:
- On Time Salah: 3/5 completed
- 10 Minute Quran: Not filled
- English Practice: Completed
- Gym Workout: Not filled
- Calendar shows 45% completion for today (5/11 tasks)

---

### Scenario 3: User Views Calendar History

**Step-by-Step**:
1. Ahmad navigates to `/user/calendar`
2. Calendar displays December 2025
3. Ahmad sees:
   - Dec 1-15: Various completion percentages (green, yellow, orange)
   - Dec 16: 80% (green)
   - Dec 17: 90% (green)
   - Dec 18: 45% (orange) - today
   - Dec 19-31: No data (gray)
4. Ahmad clicks Dec 16
5. Bottom panel shows:
   - On Time Salah: 5/5 tasks ✓
   - 10 Minute Quran: 1/1 task ✓
   - English Practice: 2/2 tasks ✓
   - Gym Workout: 1/3 tasks
   - Overall: 9/11 tasks (82%)

**Result**:
- Ahmad can review past performance
- Ahmad identifies days with low completion
- Ahmad can click "Fill Today's Entry" to backfill missing dates

---

### Scenario 4: Admin Edits Goal to Add New Task

**Step-by-Step**:
1. Admin navigates to `/admin/goals`
2. Admin clicks "Edit" on "On Time Salah" goal
3. Form pre-fills with existing data
4. Admin clicks "Add Another Task"
5. Admin adds:
   - Task 6: Name = "Tahajjud", Notes = "3:00 AM (optional)"
6. Admin clicks "Save & Assign Goal"
7. System updates Goal and creates new Task document
8. Existing GoalAssignments remain unchanged

**Result**:
- All assigned users now see 6 tasks under "On Time Salah"
- Past DailyLog entries remain unchanged (still 5 tasks)
- New entries will have 6 tasks

---

### Scenario 5: Admin Deletes a Goal

**Step-by-Step**:
1. Admin navigates to `/admin/goals`
2. Admin clicks "Delete" on "Gym Workout" goal
3. Confirmation dialog: "Are you sure? This will unassign the goal from all users."
4. Admin confirms
5. System sets `active = false` on:
   - Goal document
   - All Task documents for this goal
   - All GoalAssignment documents for this goal
6. Goal disappears from Goals List

**Result**:
- Users no longer see "Gym Workout" on their dashboards
- Historical DailyLog entries are preserved but no longer shown
- Goal can be restored by setting `active = true` (future feature)

---

## Data Flow Summary

### Goal Creation Flow
```
Admin Input (Form)
    ↓
Validation (Client-side)
    ↓
Create Goal Document (Firestore)
    ↓
Create Task Documents (Firestore, batch)
    ↓
Create GoalAssignment Documents (Firestore, batch)
    ↓
Success Message + Redirect
```

### Daily Entry Flow
```
User Input (Form)
    ↓
Validation (All tasks answered)
    ↓
Check for Existing DailyLog Entries (Firestore query)
    ↓
Update Existing OR Create New DailyLog Documents (Firestore, batch)
    ↓
Success Message + Close Form + Refresh Dashboard
```

### Dashboard Rendering Flow
```
User Login
    ↓
Fetch GoalAssignments (Firestore query)
    ↓
For Each Goal: Fetch Tasks (Firestore query)
    ↓
For Each Task: Fetch DailyLog for Selected Date (Firestore query)
    ↓
Calculate Completion Status per Goal
    ↓
Render Badges
```

### Calendar Rendering Flow
```
User Navigates to Calendar
    ↓
Fetch All DailyLog Entries for Month (Firestore query)
    ↓
Group by Date
    ↓
For Each Date: Calculate Total Tasks & Completed Tasks
    ↓
Calculate Percentage
    ↓
Assign Color Code
    ↓
Render Calendar Grid
```

---

## Key Business Rules

1. **Goal Assignment**:
   - A goal must be assigned to at least one user
   - A user can have multiple goals assigned
   - A goal can be assigned to all users via "Select All"
   - Assignments can be edited anytime (add/remove users)
   - Composite key (goalId, userId) ensures one assignment per user per goal

2. **Task Completion**:
   - All tasks are Yes/No (boolean)
   - A task can only be filled once per date per user
   - Users can backfill ANY past date (no limit)
   - Users cannot fill future dates
   - No limit on number of tasks per goal

3. **Soft Delete**:
   - Goals, Tasks, and Assignments are soft-deleted (active = false)
   - DailyLog entries are never deleted (preserved for history)

4. **Date Handling & Goal Visibility**:
   - All dates use YYYY-MM-DD format
   - Dates are stored in Asia/Dhaka timezone (UTC+6)
   - Start Date cannot be in the past
   - End Date must be after Start Date
   - Users can backfill or edit entries for ANY past date (no time limit)
   - **Dashboard (current month)**: Only shows goals where today's date is between startDate and endDate
   - **Dashboard (past/future month selected)**: Shows all goals with any overlap in that month
   - **Calendar view**: Shows all goals for the selected month range
   - **Task list**: Shows all goals when month picker is used

5. **Permissions**:
   - Only admins can create/edit/delete goals
   - Users can only view assigned goals
   - Users can only fill their own daily logs
   - All users register with role='user' (default)
   - Admins manually change roles from admin panel

6. **Notifications**:
   - Send to all active users (not filtered by goal assignments)
   - Hourly cloud function checks scheduled notifications
   - Timezone: Asia/Dhaka (Bangladesh)

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Goals collection
    match /goals/{goalId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // GoalAssignments collection
    match /goalAssignments/{assignmentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // DailyLogs collection
    match /dailyLogs/{logId} {
      allow read: if isAuthenticated() && 
                     (isOwner(resource.data.userId) || isAdmin());
      allow create: if isAuthenticated() && 
                       isOwner(request.resource.data.userId);
      allow update: if isAuthenticated() && 
                       isOwner(resource.data.userId);
      allow delete: if isAdmin();
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

---

## Firestore Indexes

Required composite indexes for efficient queries:

```javascript
// dailyLogs collection
{
  collectionGroup: "dailyLogs",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "date", order: "ASCENDING" },
    { fieldPath: "active", order: "ASCENDING" }
  ]
}

{
  collectionGroup: "dailyLogs",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "taskId", order: "ASCENDING" },
    { fieldPath: "date", order: "ASCENDING" }
  ]
}

// goalAssignments collection
{
  collectionGroup: "goalAssignments",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "active", order: "ASCENDING" }
  ]
}

// tasks collection
{
  collectionGroup: "tasks",
  fields: [
    { fieldPath: "goalId", order: "ASCENDING" },
    { fieldPath: "active", order: "ASCENDING" },
    { fieldPath: "position", order: "ASCENDING" }
  ]
}

// notifications collection
{
  collectionGroup: "notifications",
  fields: [
    { fieldPath: "active", order: "ASCENDING" },
    { fieldPath: "time", order: "ASCENDING" }
  ]
}
```

---

## Angular Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── admin.guard.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── goal.service.ts
│   │   │   ├── task.service.ts
│   │   │   ├── daily-log.service.ts
│   │   │   └── firestore.service.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── goal.model.ts
│   │       ├── task.model.ts
│   │       └── daily-log.model.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── goal-badge/
│   │   │   ├── calendar/
│   │   │   └── navbar/
│   │   └── pipes/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/
│   │   │   ├── goals-list/
│   │   │   ├── goal-form/
│   │   │   └── admin-layout/
│   │   └── user/
│   │       ├── dashboard/
│   │       ├── daily-entry/
│   │       ├── calendar/
│   │       └── user-layout/
│   └── app.component.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── assets/
```

---

## Firebase Cloud Functions (For Push Notifications)

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Scheduled function that runs every hour to check for notifications
exports.checkAndSendNotifications = functions.pubsub
  .schedule('0 * * * *') // Run every hour at minute 0
  .timeZone('Asia/Dhaka')
  .onRun(async (context) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Get all active notifications that match current time and day
    const notificationsSnapshot = await admin.firestore()
      .collection('notifications')
      .where('active', '==', true)
      .where('time', '==', currentTime)
      .get();
    
    for (const notifDoc of notificationsSnapshot.docs) {
      const notification = notifDoc.data();
      
      // Check if today is in the daysOfWeek array
      if (notification.daysOfWeek.includes(currentDay)) {
        // Get all active users with FCM tokens
        const usersSnapshot = await admin.firestore()
          .collection('users')
          .where('role', '==', 'user')
          .where('active', '==', true)
          .get();
        
        // Send notification to all users
        const messages = [];
        for (const userDoc of usersSnapshot.docs) {
          const fcmToken = userDoc.data().fcmToken;
          
          if (fcmToken) {
            messages.push({
              notification: {
                title: notification.title,
                body: notification.body,
              },
              token: fcmToken,
            });
          }
        }
        
        // Send batch notifications
        if (messages.length > 0) {
          await admin.messaging().sendEach(messages);
          console.log(`Sent ${messages.length} notifications for: ${notification.title}`);
        }
      }
    }
    
    return null;
  });

// Alternative: Run every minute for more precise timing (higher cost)
exports.checkAndSendNotificationsMinutely = functions.pubsub
  .schedule('* * * * *') // Run every minute
  .timeZone('Asia/Dhaka')
  .onRun(async (context) => {
    // Same logic as above
  });
```

**Note**: 
- The hourly function runs at the top of each hour (e.g., 9:00, 10:00, 21:00)
- All active users receive notifications (regardless of goal assignments)
- Users must grant notification permission and their FCM token must be stored in their User document
- Timezone: Asia/Dhaka (Bangladesh)

---

## GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Angular app
        run: npm run build -- --configuration production
      
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## Next Steps for Implementation

1. **Setup Firebase Project** (Not yet created):
   - Go to https://console.firebase.google.com/
   - Click "Add project" and create new project
   - Enable Firestore Database
   - Enable Authentication (Email/Password provider)
   - Enable Firebase Hosting
   - Enable Cloud Functions
   - Enable Firebase Cloud Messaging (FCM)
   - Configure security rules
   - Create composite indexes
   - Note: First user must be manually promoted to admin via Firebase Console

2. **Setup Angular Project**:
   - `ng new habit-tracker`
   - `ng add @angular/pwa`
   - `ng add @angular/fire`
   - `npm install primeng primeicons`
   - Configure PrimeNG in angular.json
   - Configure environment files with Firebase config
   - Setup mobile-first responsive CSS

3. **Implement Authentication**:
   - Login/Register pages
   - Auth service with Firebase Auth
   - Auth guard and role guard

4. **Implement Admin Features**:
   - Goals list page
   - Goal form (create/edit)
   - Notifications list page
   - Notification form (create/edit)
   - CRUD services

5. **Implement User Features**:
   - Dashboard with badges
   - Daily entry form (modal)
   - Calendar view

6. **Add PWA Features**:
   - Service worker configuration
   - Offline caching strategy
   - Install prompt

7. **Add Notifications**:
   - FCM setup in Angular
   - Request notification permission
   - Store FCM token in user document
   - Cloud Function to check notifications table and send push
   - Admin UI to create/manage notification schedules

8. **Testing & Deployment**:
   - Unit tests
   - E2E tests
   - GitHub Actions setup
   - Deploy to Firebase Hosting

---

## Summary

This is a complete, production-ready specification for Habit Tracker V1 with:
- ✅ Clear user flows and page designs
- ✅ Complete database schema with all fields
- ✅ Sample JSON for every major operation
- ✅ Detailed scenario walkthroughs
- ✅ Security rules and indexes
- ✅ Zero-cost deployment strategy
- ✅ PWA and push notification support
- ✅ Admin-managed notification scheduling (multi-day, custom time)

**Total Pages**: 10 (Auth: 2, Admin: 6, User: 4)  
**UI Framework**: PrimeNG with custom CSS (mobile-first design)  
**Total Database Collections**: 6 (User, Goal, Task, GoalAssignment, DailyLog, Notification)  
**Estimated Development Time**: 2-3 weeks for a solo developer  
**Zero-Cost Hosting**: Firebase Free Tier (Firestore, Auth, Hosting, Cloud Functions, FCM)  
**First Admin Setup**: First user registers as 'user', manually promote to 'admin' via Firebase Console
