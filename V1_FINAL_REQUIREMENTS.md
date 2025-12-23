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

### DailyLog (OPTIMIZED FOR FAST QUERIES)
| Field              | Type      | Description                                          |
|--------------------|-----------|------------------------------------------------------|
| id                 | string    | `${userId}-${YYYYMMDD}` (e.g., user123-20251223)    |
| userId             | string    | Foreign key to User (partition key for queries)      |
| date               | date      | Date of entry (YYYY-MM-DD) (sorting key)            |
| month              | string    | YYYY-MM (for month-range queries)                   |
| week               | number    | Week number 1-53 (for weekly aggregations)           |
| year               | number    | Year (for annual reports)                            |
| tasks              | array     | [{taskId, goalId, taskName, goalName, value, notes, updatedAt}] |
| goalIds            | array     | [goalId1, goalId2, ...] (denormalized for filtering) |
| active             | boolean   | Whether log entry is active                          |
| createdDate        | timestamp | When log was created                                 |
| updatedDate        | timestamp | Last update timestamp                                |
| createdBy          | string    | User ID who created this log                         |
| updatedBy          | string    | User ID who last updated this log                    |

**Firestore Indexes (Required for optimal performance)**:
```
1. Single Field Indexes:
   - userId (Ascending)
   - date (Descending)
   - month (Ascending)
   - status (Ascending)
   - completionRate (Descending)

2. Composite Indexes:
   - (userId, date DESC) → Fast single-day lookups
   - (userId, month ASC, date DESC) → Fast month-range queries
   - (userId, week ASC, date DESC) → Fast weekly queries
   - (userId, status ASC, date DESC) → Fast status filtering
   - (userId, year ASC, month ASC) → Fast annual reports
```

**Unique Identifier**: id = `${userId}-${YYYYMMDD}` ensures uniqueness and **O(1) direct document access**

**Query Optimization**:

```typescript
// ⚡ FAST - Direct document access using composite ID
db.collection('dailyLogs').doc('user123-20251223').get()
// Result: ~1ms (direct read)

// ⚡ FAST - Month range query (indexed: userId, month, date)
db.collection('dailyLogs')
  .where('userId', '==', 'user123')
  .where('month', '==', '2025-12')
  .orderBy('date', 'desc')
  .get()
// Result: ~10-50ms (single month)

// ⚡ FAST - Weekly summary (indexed: userId, week, date)
db.collection('dailyLogs')
  .where('userId', '==', 'user123')
  .where('week', '==', 52)
  .orderBy('date', 'desc')
  .get()
// Result: ~10-20ms

// ⚡ FAST - Filter by completion status (indexed: userId, status, date)
db.collection('dailyLogs')
  .where('userId', '==', 'user123')
  .where('status', '==', 'partial')
  .where('date', '>=', startDate)
  .where('date', '<=', endDate)
  .orderBy('date', 'desc')
  .get()
// Result: ~15-30ms

// ⚡ FAST - Get incomplete days in month (indexed: userId, month, status)
db.collection('dailyLogs')
  .where('userId', '==', 'user123')
  .where('month', '==', '2025-12')
  .where('status', '!=', 'completed')
  .orderBy('status')
  .orderBy('date', 'desc')
  .get()
// Result: ~20-40ms

// ⚡ FAST - Filter by specific goal (using denormalized goalIds array)
db.collection('dailyLogs')
  .where('userId', '==', 'user123')
  .where('goalIds', 'array-contains', 'goalId123')
  .where('month', '==', '2025-12')
  .orderBy('date', 'desc')
  .get()
// Result: ~15-25ms (array-contains is optimized in Firestore)

// 🐢 SLOW - Range query without month field (full scan)
db.collection('dailyLogs')
  .where('userId', '==', 'user123')
  .where('date', '>=', '2025-11-01')
  .where('date', '<=', '2026-01-31')
  .get()
// Result: ~100-500ms (crosses multiple months, slower scan)
```

**Example Optimized Document**:
```json
{
  "id": "user123-20251223",
  "userId": "user123",
  "date": "2025-12-23",
  "dateTimestamp": 1703289600,
  "month": "2025-12",
  "week": 52,
  "year": 2025,
  "goalIds": ["goal1", "goal2", "goal3"],
  "tasks": [
    { "taskId": "t1", "goalId": "goal1", "taskName": "Fajr Prayer", "goalName": "On Time Salah", "value": true, "notes": "", "updatedAt": 1703337600000 },
    { "taskId": "t2", "goalId": "goal1", "taskName": "Dhuhr Prayer", "goalName": "On Time Salah", "value": false, "notes": "", "updatedAt": 1703337600000 },
    { "taskId": "t3", "goalId": "goal2", "taskName": "10 Min Quran", "goalName": "Quran Study", "value": true, "notes": "", "updatedAt": 1703337600000 }
  ],
  "active": true,
  "createdDate": 1703337600000,
  "createdBy": "user123",
  "updatedDate": 1703337600000,
  "updatedBy": "user123"
}
```

**Performance Benchmarks** (Firestore):
| Query Type | With Index | Without Index | Optimization |
|-----------|-----------|--------------|-----------|
| Direct ID lookup | 1ms | 1ms | Use composite ID format |
| Single month | 10ms | 50ms | Index (userId, month, date) |
| Week range | 15ms | 100ms | Index (userId, week, date) |
| Status filter | 20ms | 200ms | Index (userId, status, date) |
| Goal filter | 15ms | 150ms | Denormalize goalIds array |
| Multi-month | 100ms | 1000ms | Use month field, not date range |

**Advantages of Optimized Structure**:
- ✅ One document per user per day (perfect for import/export)
- ✅ Direct `O(1)` access using composite ID format `${userId}-${YYYYMMDD}`
- ✅ Atomic updates (all tasks saved together, no partial writes)
- ✅ Denormalized `goalIds` array for fast goal-based filtering
- ✅ Month/Year/Week fields for optimized range queries (no date range scans)
- ✅ Seamless mapping to Excel format (tasks array = daily columns)

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
│  Goals Management       [+ Create New Goal] [📥 Import] [📤 Export] │
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
   - Click "Import" → Open file uploader dialog for CSV/Excel import
   - Click "Export" → Download goals and daily logs as Excel file with monthly sheet

---

### 1.5. Import/Export Goals Feature
**Feature**: Admin can export goal completion data to Excel and import bulk data from CSV/Excel

#### A. Export Goals to Excel
**Route**: Triggered from `/admin/goals` page via [📤 Export] button

**UI - Export Dialog**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ✕ | Export My Goals to Excel                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Select Date Range to Export: *                                  │
│                                                                  │
│ From: [📅 November 1, 2025]  (Start Date)                       │
│                                                                  │
│ To:   [📅 January 31, 2026]  (End Date)                         │
│                                                                  │
│ 📋 Summary: 3 months selected (November, December, January)      │
│                                                                  │
│ 👤 Exporting: Ahmad Khan (Current User)                         │
│ (Your assigned goals and daily entries will be exported)        │
│                                                                  │
│ Include Data:                                                    │
│ [✓] Daily Completion Data (Yes/No for each day)                 │
│                                                                  │
│          [Cancel]                    [Export as Excel]          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Excel Output Format**:
- **Filename**: `Goals_Nov2025_Jan2026.xlsx` (Start and End month in filename)
- **Multiple Sheets**: One sheet per month in the date range
  - Sheet 1: `November 2025`
  - Sheet 2: `December 2025`
  - Sheet 3: `January 2026`
- **Each Sheet Structure**:
  - **Row 1**: Header row with "Daily Task Entry Form" in first column, empty columns 2 onwards
  - **Row 2**: Day numbers (1-30/31) starting from column 3
  - **Row 3**: Day names (Monday, Tuesday, etc.) starting from column 3
  - **Row 4 onwards**: Goal and Task data
    - Column 1: Goal name (merged cells for all tasks of same goal)
    - Column 2: Task name
    - Columns 3+: Checkboxes for each day (☑️ = Completed, ☐ = Not Completed, Empty = Not Filled)
  - **Checkbox Values**: 
    - ☑️ (Checked) = TRUE = Yes/Completed
    - ☐ (Unchecked) = FALSE = No/Not Completed
    - Empty cell = No entry filled
  - **Visual Representation**: Each cell contains a clickable checkbox that can be toggled on/off

**Export Options**:
1. **Date Range Selection**: Admin selects from date and to date (can span multiple months)
2. **Auto-generates Sheets**: One sheet created per month in the range
3. **Filter by Users**: Select which users' data to include
4. **Data Preservation**: Sheet name stores month/year info for re-import

**Flow**:
1. Admin/User clicks [📤 Export] button on Goals List page
2. Export dialog opens with date range selector
3. Current user name is automatically displayed (no selection needed)
4. User selects start date and end date (default: current month)
5. System calculates month range and shows summary
6. User clicks "Export as Excel"
7. System fetches:
   - All goals assigned to current user for each month in the range
   - All tasks for those goals
   - All DailyLog entries for current user in each month
8. System generates Excel file with:
   - Multiple sheets (one per month)
   - Each sheet contains goal rows, task rows, and completion data
   - Sheet names store date information (e.g., "November 2025")
9. File downloads automatically: `Goals_Nov2025_Jan2026.xlsx`
10. Success message: "Export completed successfully! (3 months exported)"

**Sample JSON Data Structure for Export**:
```typescript
// Service returns this structure
interface ExportData {
  month: string; // "December 2025"
  startDate: string; // "2025-12-01"
  endDate: string; // "2025-12-31"
  totalDays: number; // 31
  goals: {
    goalId: string;
    goalName: string;
    goalDescription: string;
    tasks: {
      taskId: string;
      taskName: string;
      taskNotes: string;
      dailyData: {
        date: string;
        value: boolean | null; // true = Y, false = N, null = empty
      }[];
      completionPercentage: number; // 0-100
    }[];
  }[];
  currentUserId: string; // Current user exporting data
}
```

**Export Behavior**:
- Only goals assigned to the current user are exported
- Each user exports only their own data
- No selection of other users needed
- Simplifies UI and prevents data access issues
- Perfect for users downloading their personal habit data

---

#### B. Import Goals from Excel/CSV
**Route**: Triggered from `/admin/goals` page via [📥 Import] button

**UI - Step 1: File Upload & Analysis**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ✕ | Import Goals from Excel/CSV - Step 1: Upload & Analyze    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Upload File: [Choose File...] (*.xlsx, *.csv)                   │
│             Goals_Nov2025_Jan2026.xlsx ✓                        │
│                                                                  │
│ [Analyze File]  or  [Cancel]                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**UI - Step 2: Review Analysis & Preview**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ✕ | Import Goals - Step 2: Review Analysis                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 📊 ANALYSIS RESULTS (Read-only, no data created yet)            │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ File: Goals_Nov2025_Jan2026.xlsx                          │  │
│ │ Sheets: 3 (November 2025, December 2025, January 2026)    │  │
│ │ Date Range: November 1, 2025 - January 31, 2026           │  │
│ │                                                           │  │
│ │ 🎯 GOALS ANALYSIS:                                        │  │
│ │ ├─ Total Goals in File: 4                                │  │
│ │ ├─ NEW Goals (will create):           2                 │  │
│ │ │  ├─ "Gym Workout" [3 tasks] ✓ NEW                 │  │
│ │ │  └─ "Morning Meditation" [2 tasks] ✓ NEW          │  │
│ │ └─ EXISTING Goals (found in system):  2                 │  │
│ │    ├─ "On Time Salah" [5 tasks] ✓ EXISTS            │  │
│ │    └─ "English Practice" [2 tasks] ✓ EXISTS         │  │
│ │                                                           │  │
│ │ 📋 TASKS ANALYSIS:                                        │  │
│ │ Total Tasks in File: 11                                 │  │
│ │                                                           │  │
│ │ NEW GOALS (will be created):                            │  │
│ │ ├─ Gym Workout [3 NEW tasks]                            │  │
│ │ │  ├─ Cardio ✓ NEW                                   │  │
│ │ │  ├─ Strength ✓ NEW                                 │  │
│ │ │  └─ Stretching ✓ NEW                               │  │
│ │ └─ Morning Meditation [2 NEW tasks]                     │  │
│ │    ├─ Morning Mantra ✓ NEW                              │  │
│ │    └─ Breathing ✓ NEW                                   │  │
│ │                                                           │  │
│ │ EXISTING GOALS (adding/updating tasks):                 │  │
│ │ ├─ On Time Salah [3 exist, 0 new]                       │  │
│ │ │  ├─ Fajr Prayer ✓ EXISTS (skip)                   │  │
│ │ │  ├─ Dhuhr Prayer ✓ EXISTS (skip)                  │  │
│ │ │  └─ (3 more tasks all exist...)                       │  │
│ │ └─ English Practice [2 exist, 1 new]                    │  │
│ │    ├─ Speaking ✓ EXISTS (skip)                         │  │
│ │    ├─ Listening ✓ EXISTS (skip)                        │  │
│ │    └─ Grammar ✓ NEW (will create)                       │  │
│ │                                                           │  │
│ │ Summary: 7 tasks new, 4 tasks existing                  │  │
│ │                                                           │  │
│ │ 📅 DAILY LOGS ANALYSIS:                                   │  │
│ │ Total Daily Entries in File: 1,023                      │  │
│ │ ├─ NEW logs (will create):        945                   │  │
│ │ │  └─ From new goals and new tasks                       │  │
│ │ └─ UPDATE logs (will overwrite):  78                    │  │
│ │    └─ Existing goals/tasks with new daily data         │  │
│ │                                                           │  │
│ │ No Conflicts: All dates in file are safe to import     │  │
│ │                                                           │  │
│ │ 👤 ASSIGNMENT:                                           │  │
│ │ ├─ Current User: Ahmad Khan (ahmad@email.com)           │  │
│ │ ├─ New Goals: Will assign ONLY to Ahmad                 │  │
│ │ ├─ Existing Goals: No changes to assignments            │  │
│ │ └─ No data loss: Import only adds/updates, never deletes│  │
│ │                                                           │  │
│ │ 🟢 Status: READY TO IMPORT - All checks passed!         │  │
│ │                                                           │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│ [Back & Change File]     [Cancel]     [✓ Confirm & Import]     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Expected CSV/Excel Format**:

```
,,Daily Task Entry Form,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31
,,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday
Goal,Task,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE
10 min quran,daily quran,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE
,quran poro,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE
,quran shikho,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE
On Time Salah,Fajr Prayer,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Dhuhr Prayer,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Asr Prayer,TRUE,FALSE,TRUE,TRUE,FALSE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Maghrib Prayer,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Isha Prayer,TRUE,TRUE,TRUE,FALSE,FALSE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
English Practice,Speaking,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Listening,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
Gym Workout,Cardio,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE
,Strength,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE
,Stretching,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
```

**Date Extraction & Sheet Mapping**:
- **Sheet Names**: Used to extract startDate and endDate
  - Sheet "November 2025" → startDate: 2025-11-01, endDate: 2025-11-30
  - Sheet "December 2025" → startDate: 2025-12-01, endDate: 2025-12-31
  - Sheet "January 2026" → startDate: 2026-01-01, endDate: 2026-01-31
- **Multiple Sheets**: All sheets processed and data merged into single import
- **Date Range**: startDate is first sheet's 1st day, endDate is last sheet's last day

**Parsing Rules**:
- **Row 1 (Header)**: "Daily Task Entry Form" - Skip this row (metadata)
- **Row 2 (Day Numbers)**: Contains day numbers (1-30/31) - Use to map columns to dates based on sheet month
- **Row 3 (Day Names)**: Contains day names (Monday, Tuesday, etc.) - For reference/validation
- **Row 4 onwards (Data Rows)**:
  - **Column 1 (Goal)**: Goal name, empty if same goal continues (merged rows)
  - **Column 2 (Task)**: Task name, required for each task
  - **Columns 3+ (Days)**: Checkboxes or equivalent values
    - ☑️ (Checked checkbox) or `TRUE` or `true` or `1` or `Y` or `Yes` = Completed (Yes)
    - ☐ (Unchecked checkbox) or `FALSE` or `false` or `0` or `N` or `No` = Not completed (No)
    - Empty cell = No entry (leave null)
    - Case-insensitive
- **Checkbox Handling**: When Excel file is downloaded, checkboxes are used for visual clarity. When imported, system converts checkboxes to TRUE/FALSE boolean values.

**Duplicate Detection & Goal/Task Matching Logic**:

**1. Goal Matching**:
- **Exact Match**: Goal name (case-insensitive) + task list = same goal
- **Similarity Check**: If goal name matches but tasks differ, flag as "potential duplicate"
- **Algorithm**:
  ```
  For each goal in import:
    1. Normalize goal name (trim, lowercase)
    2. Get list of task names from import
    3. Query system: Find goals with same name (case-insensitive)
    4. If found:
       a. Compare task names list
       b. If 80%+ task names match → SAME GOAL (skip creation)
       c. If <80% match → Different goal (create new)
    5. If not found → NEW GOAL (create)
  ```

**2. Task Matching within Goal**:
- **Exact Match**: Task name (case-insensitive) + parent goal = same task
- **Similarity Check**: Using fuzzy matching for typos
- **Algorithm**:
  ```
  For each task in goal:
    1. Normalize task name (trim, lowercase)
    2. Query system: Find tasks with same goal + task name
    3. If found (exact match) → SAME TASK (skip creation, import logs only)
    4. If not found → NEW TASK (create under existing goal)
  ```

**3. Example Scenarios**:
```
SCENARIO A: All New Goals
└─ "On Time Salah" (new) + 5 tasks (new)
   └─ Result: Create goal + create 5 tasks + assign to current user only

SCENARIO B: Goal Exists, New Tasks
└─ "On Time Salah" (exists) + [Fajr (exists), Dhuhr (exists), Tahajjud (new)]
   └─ Result: Skip goal creation, create only Tahajjud task, import logs for all tasks

SCENARIO C: Duplicate Detection
└─ "On Time Salah" (exists in system) imported again
   └─ Result: Skip goal creation, skip task creation, merge logs only

SCENARIO D: Similar Goal Names (typo)
└─ "On Time Salah" exists, import has "On Time Salat" (typo)
   └─ Result: Flag as potential duplicate, show warning in preview
   └─ Admin can choose: Create as new or merge with existing
```

**Validation Rules**:
- Goal name: Required, max 100 chars
- Task name: Required, max 100 chars
- Daily values: Must be Y/N, 1/0, true/false, or empty
- At least 1 goal required
- At least 1 task per goal
- At least 1 day of data
- File must contain valid sheet names (Month Year format)

**Sample Analysis Response (Step 2 - Read-only, before any data creation)**:
```json
{
  "step": 2,
  "status": "ANALYSIS_COMPLETE",
  "readyToImport": true,
  "dataStatus": "NO DATA CREATED YET - This is analysis only",
  "message": "Analysis complete. Review details below before confirming.",
  "dateRange": {
    "startDate": "2025-11-01",
    "endDate": "2026-01-31",
    "sheetsProcessed": 3
  },
  "goalsAnalysis": {
    "totalDetected": 4,
    "new": [
      {"name": "Gym Workout", "taskCount": 3, "action": "WILL_CREATE"},
      {"name": "Morning Meditation", "taskCount": 2, "action": "WILL_CREATE"}
    ],
    "existing": [
      {"name": "On Time Salah", "taskCount": 5, "action": "SKIP_GOAL"},
      {"name": "English Practice", "taskCount": 2, "action": "SKIP_GOAL"}
    ]
  },
  "tasksAnalysis": {
    "totalDetected": 11,
    "willCreate": 7,
    "willSkip": 4
  },
  "dailyLogsAnalysis": {
    "totalEntries": 1023,
    "willCreate": 945,
    "willUpdate": 78
  },
  "assignmentInfo": {
    "currentUser": "Ahmad Khan",
    "newGoalsAssignment": "ONLY to current user"
  },
  "warnings": [],
  "errors": [],
  "nextAction": "Review analysis and click 'Confirm & Import' to proceed, or 'Back & Change File' to cancel."
}
```

**Sample Final Response (Step 3 - After user confirms and data is created)**:
```json
{
  "step": 3,
  "status": "IMPORT_COMPLETED",
  "success": true,
  "dataStatus": "DATA SUCCESSFULLY CREATED",
  "message": "✓ Import completed successfully! All data has been created and saved.",
  "summary": {
    "goalsCreated": 2,
    "tasksCreated": 7,
    "dailyLogsCreated": 945,
    "dailyLogsUpdated": 78,
    "assignmentsCreated": 2,
    "totalDataAddedOrUpdated": 1032
  },
  "newGoals": [
    {
      "id": "goal_gym_123",
      "name": "Gym Workout",
      "tasksCreated": 3,
      "assignedTo": "ahmad@email.com"
    },
    {
      "id": "goal_meditation_456",
      "name": "Morning Meditation",
      "tasksCreated": 2,
      "assignedTo": "ahmad@email.com"
    }
  ],
  "nextSteps": "View new goals in Goals List or Export again to verify"
}
```

**Scenario 1: Create All New Goals with New Tasks**
```
Steps:
1. Admin selects file with new goals (never seen before)
2. "Create New Goals if not exist" is checked (default)
3. "Create New Tasks if not exist" is checked (default)
4. "Assign to Current User Only" is checked (default)
5. Clicks "Import & Create"
6. System:
   - Analyzes all sheets and detects zero duplicate goals
   - Creates Goal documents (with generated dates from sheet names)
   - Creates Task documents for each task
   - Creates GoalAssignment ONLY for current user (not select all)
   - Creates DailyLog entries for each day with Y/N values
7. Success: "4 goals with 11 tasks created and assigned to you!"
```

**Scenario 2: Goal Exists, Import New Tasks Only**
```
Steps:
1. Admin selects file with existing goal "On Time Salah" but new tasks
2. "Create New Goals if not exist" unchecked
3. "Create New Tasks if not exist" is checked
4. Clicks "Import & Create"
5. System:
   - Detects "On Time Salah" exists in system
   - Detects 2 new tasks: "Tahajjud" and "Sunrise Prayer"
   - Creates only the 2 new tasks under existing goal
   - Does NOT create new goal
   - Imports DailyLog entries for all tasks (old + new)
7. Success: "Found 1 existing goal, created 2 new tasks under it, imported logs!"
```

**Scenario 3: Full Import with Duplicate Detection**
```
Steps:
1. Admin selects file with mix of new and existing goals
2. All options checked (default)
3. Clicks "Import & Create"
4. System analyzes file:
   - Detects "On Time Salah" + 5 tasks = DUPLICATE (skip)
   - Detects "English Practice" = EXISTS but 3 tasks (2 exist, 1 new)
   - Detects "Gym Workout" = NEW (create)
   - Shows preview with analysis
5. Admin reviews and confirms
6. System:
   - Creates "Gym Workout" + 3 tasks
   - Creates 1 new task under "English Practice"
   - Assigns only current user to new goals
   - Imports all DailyLog entries
7. Success: "Analyzed 4 goals. Created 1 new goal (3 tasks), added 1 task to existing goal, imported logs!"
```

**Error Handling**:
- **Duplicate Goals**: Show as "DUPLICATE - SKIPPED" in preview, can be merged
- **Similar Goal Names** (typo): Flag with "⚠️ POTENTIAL DUPLICATE" - show similarity %
- **Missing Task Name**: Skip row, show warning
- **Invalid Sheet Names**: Extract month/year, show warning if invalid format
- **File Format Issues**: Detect Excel/CSV automatically
- **Permission Issues**: Only current user is assigned to new goals

**Flow - 3 Step Import Process (Safe Data Creation)**:

**STEP 1: Upload & Analyze**
1. User clicks [📥 Import] button on Goals List page
2. Import dialog opens (Step 1: Upload)
3. User selects file (Excel or CSV)
4. User clicks [Analyze File]
5. System immediately analyzes file WITHOUT creating any data:
   - Parses all sheets and extracts date range from sheet names
   - Detects all goals in file
   - Detects all tasks for each goal
   - Queries database to find which goals already exist
   - Queries database to find which tasks exist under each goal
   - Counts daily log entries and identifies new vs updates
   - Checks for duplicates and conflicts
   - **CRITICAL: NO DATA IS CREATED YET - This is read-only analysis**

**STEP 2: Review Analysis**
6. Dialog moves to Step 2: Review Analysis
7. System displays detailed breakdown showing:
   - Which goals will be CREATED (new goals)
   - Which goals already EXIST (will be skipped)
   - Which tasks will be CREATED (new tasks)
   - Which tasks already EXIST (will be skipped)
   - How many daily logs will be created vs updated
   - Current user assignment confirmation
   - Clear status: "READY TO IMPORT - All checks passed!"
8. User carefully reviews the analysis
9. User can see EXACTLY what will be added before confirming
10. **User can cancel here [Back & Change File] and nothing is created**

**STEP 3: Confirm & Execute**
11. User clicks [✓ Confirm & Import]
12. System validates all data one final time
13. System NOW creates/updates (data creation happens only after confirmation):
    - Goal documents (only new goals)
    - Task documents (only new tasks within goals)
    - GoalAssignment documents (ONLY for current importing user)
    - DailyLog documents (new entries and updates)
14. System shows progress: "Creating 2 goals... Creating 7 tasks... Importing 1,023 daily logs..."
15. User sees detailed success message with exact counts
16. User can review complete import summary
17. User redirected to Goals List to verify newly created goals

**KEY SAFETY FEATURES**:
- ✅ Analysis phase is 100% read-only (no database changes)
- ✅ Users see exactly what will happen BEFORE confirming
- ✅ Clear breakdown of new vs existing items
- ✅ Option to go back and select different file
- ✅ Final confirmation required before data creation
- ✅ Prevents accidental data creation completely
- ✅ If user cancels at Step 2, nothing is created
- ✅ Easy to understand and verify what's being added

**Sample Import Response**:
```json
{
  "success": true,
  "message": "Import completed successfully",
  "dateRange": {
    "startDate": "2025-11-01",
    "endDate": "2026-01-31",
    "sheetsProcessed": 3
  },
  "analysis": {
    "goalsDetected": 4,
    "goalsNew": 2,
    "goalsExisting": 2,
    "taskDetected": 11,
    "tasksNew": 5,
    "tasksExisting": 6,
    "duplicatesDetected": 0,
    "potentialDuplicates": 0
  },
  "stats": {
    "goalsCreated": 2,
    "goalsSkipped": 2,
    "tasksCreated": 5,
    "tasksSkipped": 6,
    "logsCreated": 923,
    "logsUpdated": 100,
    "assignmentsCreated": 2,
    "errorsFound": 0
  },
  "assignmentInfo": {
    "message": "New goals assigned to: Ahmad Khan (current user)",
    "userAssigned": "ahmad@email.com"
  },
  "errors": []
}
```

---

#### C. Sample Excel Files for Reference

**Export Example - December 2025**:

```
,,Daily Task Entry Form,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31
,,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday
Goal,Task,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
On Time Salah,Fajr Prayer,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Dhuhr Prayer,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Asr Prayer,TRUE,FALSE,TRUE,TRUE,FALSE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Maghrib Prayer,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Isha Prayer,TRUE,TRUE,TRUE,FALSE,FALSE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
10 Minute Quran,10 Min Recitation,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,FALSE
English Practice,Speaking,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
,Listening,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
Gym Workout,Cardio,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE
,Strength,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE,TRUE,FALSE,FALSE
,Stretching,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE
```

**Technical Implementation Details**:

**Dependencies**:
- `exceljs` (npm package) - For reading/writing Excel files
- `papaparse` (npm package) - For parsing CSV files
- Angular HttpClient - For file upload

**Service Methods**:
```typescript
// Export service methods
exportGoalsToExcel(month: Date, userIds: string[], options: ExportOptions): Observable<Blob>
exportGoalsToCsv(month: Date, userIds: string[], options: ExportOptions): Observable<Blob>
generateExcelFile(exportData: ExportData): Blob

// Import service methods
importGoalsFromFile(file: File, options: ImportOptions): Observable<ImportResult>
parseExcelFile(file: File): Observable<ParsedGoalData>
parseCsvFile(file: File): Observable<ParsedGoalData>
validateImportData(data: ParsedGoalData): ValidationError[]
createGoalsFromImport(data: ParsedGoalData, options: ImportOptions): Observable<ImportResult>
```

**Database Impact**:
- **Export**: Read-only operation, no database changes
- **Import**: 
  - Creates new Goal, Task, GoalAssignment, DailyLog documents
  - Updates existing documents if merge options selected
  - Preserves existing records, adds new ones
  - No data loss during import

**Performance Considerations**:
- Large files (1000+ rows): Process in batches to avoid UI blocking
- Use web workers for file parsing
- Implement progress indicator for long imports
- Cache month/year detection logic

**Security Considerations**:
- Only admins can export/import
- File upload size limit: 10MB
- Validate file format before processing
- Sanitize goal/task names from import
- Log all import operations for audit trail
- Confirm user selection before creating bulk data

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
