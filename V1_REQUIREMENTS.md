## Example Database Entries & Table Visualization

Below are sample rows for each table, shown as markdown tables for clarity.

### User
| id | name    | email             | role  | createdAt           | updatedAt           |
|----|---------|-------------------|-------|---------------------|---------------------|
| 1  | Ahmad   | ahmad@email.com   | user  | 2025-12-01 10:00:00 | 2025-12-01 10:00:00 |
| 2  | Fatima  | fatima@email.com  | user  | 2025-12-01 10:01:00 | 2025-12-01 10:01:00 |
| 3  | Admin   | admin@email.com   | admin | 2025-12-01 09:00:00 | 2025-12-01 09:00:00 |

### Goal
| id | name                | description                        | dataType   | category        | startDate   | endDate     | active | Tasks[] |
|----|---------------------|------------------------------------|------------|-----------------|-------------|-------------|--------|---------|
| 1  | On Time Salah       | Complete all 5 daily prayers on time| boolean    | standard        | 2025-12-01  | 2025-12-31  | true   | [1-5]   |
| 2  | Quran Recitation    | Complete Surah Baqarah in 30 days   | boolean    | quran_planner   | 2025-12-01  | 2025-12-30  | true   | [6-35]  |

### Task
| id | goalId | label           | optionsJson | displayTime | position | createdAt           | updatedAt           |
|----|--------|-----------------|-------------|-------------|----------|---------------------|---------------------|
| 1  | 1      | Fajr            | null        | 05:30       | 1        | 2025-12-01 10:00:00 | 2025-12-01 10:00:00 |
| 2  | 1      | Dhuhr           | null        | 13:00       | 2        | 2025-12-01 10:00:00 | 2025-12-01 10:00:00 |
| 3  | 1      | Asr             | null        | 16:30       | 3        | 2025-12-01 10:00:00 | 2025-12-01 10:00:00 |
| 4  | 1      | Maghrib         | null        | 18:45       | 4        | 2025-12-01 10:00:00 | 2025-12-01 10:00:00 |
| 5  | 1      | Isha            | null        | 20:30       | 5        | 2025-12-01 10:00:00 | 2025-12-01 10:00:00 |
| 6  | 2      | Day 1: 1-10     | null        | null        | 1        | 2025-12-01 10:05:00 | 2025-12-01 10:05:00 |
| 7  | 2      | Day 2: 11-20    | null        | null        | 2        | 2025-12-01 10:05:00 | 2025-12-01 10:05:00 |
|... | ...    | ...             | ...         | ...         | ...      | ...                 | ...                 |

### GoalAssignment
| goalId | userId | assignedAt           |
|--------|--------|---------------------|
| 1      | 1      | 2025-12-01 11:00:00 |
| 1      | 2      | 2025-12-01 11:00:00 |
| 2      | 1      | 2025-12-01 11:00:00 |
| 2      | 2      | 2025-12-01 11:00:00 |


### DailyLog (Unified)
| userId | taskId | goalId | date       | valueBoolean | valueArrayJson | createdAt           | updatedAt           |
|--------|--------|--------|------------|--------------|---------------|---------------------|---------------------|
| 1      | 1      | 1      | 2025-12-16 | true         | null          | 2025-12-16 22:01:00 | 2025-12-16 22:01:00 |
| 1      | 2      | 1      | 2025-12-16 | true         | null          | 2025-12-16 22:01:00 | 2025-12-16 22:01:00 |
| 1      | 3      | 1      | 2025-12-16 | false        | null          | 2025-12-16 22:01:00 | 2025-12-16 22:01:00 |
| 1      | 4      | 1      | 2025-12-16 | true         | null          | 2025-12-16 22:01:00 | 2025-12-16 22:01:00 |
| 1      | 5      | 1      | 2025-12-16 | true         | null          | 2025-12-16 22:01:00 | 2025-12-16 22:01:00 |
| 1      | 6      | 2      | 2025-12-16 | true         | null          | 2025-12-16 22:02:00 | 2025-12-16 22:02:00 |
| 1      | 7      | 2      | 2025-12-16 | false        | null          | 2025-12-16 22:02:00 | 2025-12-16 22:02:00 |
| ...    | ...    | ...    | ...        | ...          | ...           | ...                 | ...                 |

### Goal Categories

####  Standard Goals (Manual Task Creation)
- Admin creates goal
- Admin manually adds multiple tasks
- Each task tracks Yes/No completion
- **Examples**: 
  - 5 Times Salah (5 tasks: Fajr, Dhuhr, Asr, Maghrib, Isha)
  - English Practice (2 tasks: Speaking, Listening)

## Unified Model (Applies to All Goals)

This model standardizes how goals, tasks, inputs, and progress work across Standard and Quran Planner goals. Intraday doses (e.g., medication) are handled as regular tasks with time labels.

### Entities
- **Goal**: `{ id, name, description, category, recurrence, assignments[], active, startDate?, endDate? }`
- **Task**: `{ id, goalId, label, type, displayTime?, unit?, generated? }`
  - `type`: `boolean` (Yes/No), `count` (numeric, e.g., ayahs), `select` (multi-select)
  - `displayTime?`: optional informational time label (e.g., 8:00 AM)
  - `unit?`: e.g., `ayah` for Quran
  - `generated?`: true for planner-created segments (Quran Day 1…N)
- **DailyLog**: `{ date, goalId, entries: TaskEntry[] }`
  - `TaskEntry`: `{ taskId, value }` where `value` depends on `type`: `Yes|No` | number | array

### Recurrence
- `daily`: All goals repeat daily (V1 only)

Note: Multiple tasks per day (e.g., medication doses with times) and planner-generated tasks (e.g., Quran day-cards) are just regular tasks. Times are informational; no special recurrence types in V1.

### Inputs (Nightly Form)
- **Standard**: Per-task Yes/No
- **Quran Planner**: Optional number input (ayahs) OR checking completed day-cards
- **Medication/Doses**: Yes/No per dose (time-labelled sub-tasks)

### Progress Rules
- **Standard**: Per-day progress = fraction of tasks marked Yes
- **Quran Planner**:
  - If ayah number provided: auto-map across day-cards; mark full/partial tasks
  - Else: use checked day-cards
  - Overall progress bar = total ayahs completed / total ayahs
  - Visibility: fully completed day-cards hidden on future nights
- **Medication (multiple doses)**:
  - Per-day progress = `Taken X/Y doses`
  - Weekly tally: `Days with all doses taken` (guidance only)

### Dashboard Badge (Unified)
```
┌────────────────────────┐
│ [Icon] Goal Name       │
│ Today: Completed/Partial/Not filled │
│ [Task indicators]      │  ← ✓ done | ⏰ pending
└────────────────────────┘
```

## Core Features (MVP - Version 1.0)

### 1. Goal & Task Management
- Admin can create goals with:
  - Goal Name
  - Description
  - Goal Category (Standard or Quran Planner)
- For Standard Goals:
  - Admin manually adds tasks (Yes/No type only)
  - Each task has name and optional time
- For Quran Planner Goals:
  - Admin specifies Surah range (From/To)
  - Admin specifies Ayah range (From/To)
  - Admin sets number of days
  - System auto-generates tasks dividing the range
- Admin can assign same goal to multiple users
- Admin can edit/delete goals and tasks
- Admin can set goal as active/inactive
- Admin can view which users are assigned to each goal

### 2. Daily Tracking
- User dashboard showing all assigned active goals (view-only badges)
- Single daily entry form at night for all goals
- Date selector to fill entries for any date
- Simple Yes/No inputs for all tasks
- One-time submission for all goals together
- Calendar view showing completion history

---

## User Roles

### Admin
- Create/edit/delete goals
- Assign goals to single or multiple users
- View all user data and progress
- Monitor user performance across assigned goals
- Configure system settings

### User
- View only assigned goals
- Mark Yes/No tasks as complete
- View personal progress for assigned goals only
- Fill single daily entry form at night

---

## Dashboard Layout (2 Badges Per Row)

### Badge Format (Simple View)

**Badge Structure** (applies to both Standard and Quran Planner goals):
```
┌────────────────────────┐
│ [Icon] Goal Name       │  ← Line 1: Icon + Goal Name
│ Today: Not filled      │  ← Line 2: Today's status
│ [Task indicators]      │  ← Line 3: Task status (✓ ⏰)
└────────────────────────┘
```

### User Dashboard View
```
┌─────────────────────────────────────────────────────────┐
│ Goal Tracker | Profile Icon | Settings                 │
├─────────────────────────────────────────────────────────┤
│ Monday, December 16, 2025                               │
│ < Previous Date | Next Date >                           │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 🕌 On Time Salah       │ │ 📚 English Practice    │  │
│ │ Today: Completed       │ │ Today: Completed       │  │
│ │ ✓ All 5 prayers done   │ │ ✓ Both tasks done      │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 📖 Quran Recitation    │ │ 🏋️ Gym Workout         │  │
│ │ Today: Completed       │ │ Today: Not filled      │  │
│ │ ✓ Day 16 done          │ │ ⏰ Pending              │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 💊 Medication          │ │ 📝 Daily Journal       │  │
│ │ Today: Not filled      │ │ Today: Not filled      │  │
│ │ ⏰ Pending              │ │ ⏰ Pending              │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│              [📝 Fill Today's Entry - All Goals]        │
│                                                          │
│ Bottom Nav: [Home] [Calendar] [Settings]               │
└─────────────────────────────────────────────────────────┘
```

**Dashboard Features**:
- **Badge Display**: View-only status showing all goals
- **Date Navigation**: Navigate between dates to view history
- **Single Entry Button**: User clicks one button to fill all goals at once
- **No Individual Badge Clicks**: Badges are informational only

---

## Single Daily Entry Form at Night

### User Flow:
1. User opens app at night (e.g., 10 PM)
2. Clicks "Fill Today's Entry - All Goals" button
3. Opens single form with date selector
4. Fills all goals in one form
5. Submits once

### Entry Form View:
```
┌───────────────────────────────────────────────────┐
│ ✕ | Daily Entry Form                              │
├───────────────────────────────────────────────────┤
│                                                    │
│ Select Date: [📅 December 16, 2025 ▼]             │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 1: On Time Salah                             │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you complete all 5 prayers today?             │
│                                                    │
│ 1. Fajr                  [○Yes  ○No]              │
│ 2. Dhuhr                 [○Yes  ○No]              │
│ 3. Asr                   [○Yes  ○No]              │
│ 4. Maghrib               [○Yes  ○No]              │
│ 5. Isha                  [○Yes  ○No]              │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 2: English Practice                          │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Speaking Practice 5 min   [○Yes  ○No]          │
│ 2. Listening Practice 5 min  [○Yes  ○No]          │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 3: Quran Recitation (Surah Baqarah)         │
│ Overall Progress: [████░░░░░░░░░░░░] 25/286 (8%) │
├───────────────────────────────────────────────────┤
│                                                    │
│ Enter ayahs completed today: [____] ayahs         │
│                                                    │
│ ┌─────────────────────────────────────────────┐  │
│ │ Task Progress (Auto-calculated)              │  │
│ │                                               │  │
│ │ [ ] Day 1: 1-10   [██████████] 10/10 ✓       │  │
│ │ [ ] Day 2: 11-20  [██████████] 10/10 ✓       │  │
│ │ [✓] Day 3: 21-30  [█████░░░░░] 5/10  (50%)   │  │
│ │ [ ] Day 4: 31-40  [░░░░░░░░░░] 0/10          │  │
│ │ [ ] Day 5: 41-50  [░░░░░░░░░░] 0/10          │  │
│ │                                               │  │
│ │ ℹ️ Type ayah count above to auto-calculate    │  │
│ │ OR manually check completed tasks             │  │
│ └─────────────────────────────────────────────┘  │
│                                                    │
│ Current Input: 25 ayahs                            │
│ → Day 1 Complete (10), Day 2 Complete (10),       │
│    Day 3 Partial (5/10)                            │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 4: Gym Workout                               │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you complete workout today?  [○Yes  ○No]      │
│                                                    │
│ If Yes, which exercises?                          │
│ [ ] Cardio 30 min                                 │
│ [ ] Strength Training                             │
│ [ ] Stretching 10 min                             │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 5: Daily Journal                             │
├───────────────────────────────────────────────────┤
│                                                    │
│ Write Journal Entry      [○Yes  ○No]              │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 6: Medication                                │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you take all doses today?                     │
│                                                    │
│ 1. Morning Dose (8 AM)   [○Yes  ○No]              │
│ 2. Afternoon Dose (2 PM) [○Yes  ○No]              │
│ 3. Night Dose (10 PM)    [○Yes  ○No]              │
│                                                    │
├───────────────────────────────────────────────────┤
│                                                    │
│ 📊 Summary: 6 goals, 20+ tasks                    │
│                                                    │
│        [Cancel] [Save All Entries]                │
│                                                    │
└───────────────────────────────────────────────────┘
```

**Form Features**:
- **Date Selector at Top**: User can select any past/current date
- **All Goals in One Form**: Sequential list of all active goals
- **Standard Goals**: Simple Yes/No radio buttons for each task
- **Quran Goals**: Checkboxes for task selection OR custom ayah number input
- **Single Submit**: One save button for all entries
- **Scrollable**: Form scrolls if many goals
- **Default Date**: Auto-selects today's date

**Quran Planner Tracking:**
- **Checkbox selection**: Select complete tasks (Day 1, Day 2, etc.)
- **Custom number input**: Enter exact ayah count for flexible reading
- **Logic**: If number entered → use that, else count checked tasks
- **Progress bar**: Visual feedback showing overall ayah completion

---

## Admin Goal Creation Form (MVP Version)

```
┌─────────────────────────────────────────────────────────┐
│ ← Cancel | Create New Goal | [Save]                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Goal Name *                                             │
│ [_______________________________________________]        │
│                                                          │
│ Description                                             │
│ [_______________________________________________]        │
│ [_______________________________________________]        │
│                                                          │
│ Goal Category *                                         │
│ ( ) Standard Goal (Manual task creation)                │
│                                                          │
│ Start Date                                              │
│ [📅 Select]                                             │
│                                                          │
│ End Date                                                │
│ [📅 Select]                                             │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ [IF STANDARD GOAL SELECTED]                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Tasks (Manual Entry) *                                  │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Task 1                                          │    │
│ │ Name: [_______________________________]        │    │
│ │ [Remove]                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Task 2                                          │    │
│ │ Name: [_______________________________]        │    │
│ │ [Remove]                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [+ Add Another Task]                                    │
├─────────────────────────────────────────────────────────┤
│ Assign to Users                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Assign to Users *                                       │
│ [✓] Select All                                          │
│ [ ] User 1 - Ahmad                                      │
│ [ ] User 2 - Fatima                                     │
│ [ ] User 3 - Ibrahim                                    │
│ [ ] User 4 - Aisha                                      │
│                                                          │
│ [Cancel] [Save & Assign Goal]                           │
└─────────────────────────────────────────────────────────┘
```

---

 

## Admin Task Creation Flow (Step-by-Step)

### Standard Goal (e.g., Salah, English, Gym, Journal, Medication)
1. Click Create New Goal.
2. Enter Goal Name and Description.
3. Select Goal Category: Standard Goal.
4. Scheduling: Choose Start Date (defaults to Today). Leave End Date blank (V1).
5. Add Tasks:
  - Enter Task Name (e.g., “Fajr”, “Morning Dose”, “Cardio 30 min”).
  - Optional: Add display time (e.g., 5:30 AM, 8:00 AM) for user context.
  - [+ Add Another Task] as needed.
6. Assign to Users and Save & Assign Goal.

Result: Tasks appear every day from Start Date while the goal is active. Users confirm Yes/No at night.

### Quran Planner Goal
1. Click Create New Goal.
2. Enter Goal Name and Description.
3. Select Goal Category: Quran Planner.
4. Scheduling: Choose Start Date (defaults to Today). End Date is not required.
5. Range & Days:
  - Select From/To Surah and Ayah.
  - Enter Number of Days to Complete.
  - Preview Auto-Generated Tasks (Day 1 … Day N).
6. Assign to Users and Save & Assign Goal.

Result: The system creates N labeled tasks (Day 1 … Day N) by evenly dividing the ayah range. The nightly form surfaces the next incomplete task; users can backfill any date with the date selector.

### What gets saved on Save & Assign
- Goal: name, description, category, startDate, active=true
- Tasks: for Standard — as entered (with optional displayTime); for Quran Planner — generated (Day 1…N)
- Assignments: selected users

---

## Calendar View Page

```
┌─────────────────────────────────────────────────────────┐
│ ← Back | December 2025                | Today >         │
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
│  15    [16]   17    18    19    20    21                │
│  100%  [80%]  --    --    --    --    --                │
│  🟢    [🟢]   ⚪    ⚪    ⚪    ⚪    ⚪                  │
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
│ Selected: December 16, 2025                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Daily Habits Completion:                                │
│                                                          │
│ ✓ On Time Salah (5/5 tasks)                             │
│ ✓ English Practice (2/2 tasks)                          │
│ ✓ Quran Recitation (1/1 task)                           │
│ ✗ Gym Workout (0/3 tasks)                               │
│ ✓ Daily Journal (1/1 task)                              │
│ ✗ Medication (0/3 tasks)                                │
│                                                          │
│ Overall: 9/15 tasks completed (60%)                     │
│                                                          │
│ Legend:                                                 │
│ 🟢 100% | 🟢 80-99% | 🟡 60-79% | 🟠 40-59% | ⚪ No data │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Settings Page

```
┌─────────────────────────────────────────────────────────┐
│ ← Back | Settings                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Profile                                                 │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [Profile Picture]                                │    │
│ │ Name: [_____________________________]           │    │
│ │ Email: [_____________________________]          │    │
│ │ [Update Profile]                                │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Preferences                                             │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Theme: ( ) Light ( ) Dark ( ) Auto              │    │
│ │ Start of week: [Sunday ▼]                       │    │
│ │ Date format: [MM/DD/YYYY ▼]                     │    │
│ │ Language: [English ▼]                           │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Account                                                 │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [Change Password]                                │    │
│ │ [Logout]                                         │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Example Scenarios (MVP)


### Scenario 1: Admin Creates "On Time Salah" Goal

**Admin Input:**
- Goal Name: `On Time Salah`
- Description: `Complete all 5 daily prayers on time`
- dataType: `boolean`
- Goal Category: `standard`
- Tasks:
  - Task 1: `Fajr` (displayTime: 5:30 AM)
  - Task 2: `Dhuhr` (displayTime: 1:00 PM)
  - Task 3: `Asr` (displayTime: 4:30 PM)
  - Task 4: `Maghrib` (displayTime: 6:45 PM)
  - Task 5: `Isha` (displayTime: 8:30 PM)
- Assign to: All Users

**User Experience:**
- Sees "On Time Salah" badge on dashboard
- At night, opens entry form
- Fills Yes/No for each of 5 prayers
- Submits once
- Dashboard updates showing completion status

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: On Time Salah
Description: Complete all 5 daily prayers on time

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

[STANDARD GOAL - TASKS]

Task 1:
- Name: Fajr
- Time (Optional): 5:30 AM

Task 2:
- Name: Dhuhr
- Time (Optional): 1:00 PM

Task 3:
- Name: Asr
- Time (Optional): 4:30 PM

Task 4:
- Name: Maghrib
- Time (Optional): 6:45 PM

Task 5:
- Name: Isha
- Time (Optional): 8:30 PM

[COMMON SETTINGS]

Assign to Users:
- ✓ All Users
 
 Start Date: [📅 Select]
 End Date:   [📅 Select]
```

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 🕌 On Time Salah       │
│ Today: 3/5 tasks       │
│ ✓ Fajr ✓ Dhuhr ✓ Asr  │
│ ⏰ Maghrib ⏰ Isha      │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):
```
├───────────────────────────────────────────────────┤
│ Goal: On Time Salah                               │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Fajr    [○Yes  ○No]                            │
│ 2. Dhuhr   [○Yes  ○No]                            │
│ 3. Asr     [○Yes  ○No]                            │
│ 4. Maghrib [○Yes  ○No]                            │
│ 5. Isha    [○Yes  ○No]                            │
│                                                    │
```

 

---



### Scenario 2: Admin Creates "10 Minute Quran" Goal (Standard)

**Admin Input:**
- Goal Name: `10 Minute Quran`
- Description: `Recite Quran for 10 minutes each day`
- dataType: `boolean`
- Tasks:
  - Task 1: `10 Minute Recitation`
- Assign to: All Users

**User Experience:**
- Sees "10 Minute Quran" badge on dashboard
- At night, opens entry form
- Fills Yes/No for the recitation task
- Submits once
- Dashboard updates showing completion status

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: 10 Minute Quran
Description: Recite Quran for 10 minutes each day

[STANDARD GOAL - TASKS]

Task 1:
- Name: 10 Minute Recitation

[COMMON SETTINGS]

Assign to Users:
- ✓ All Users
 
Start Date: [📅 Select]
End Date:   [📅 Select]
```

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 📖 10 Minute Quran     │
│ Today: 0/1 task        │
│ ⏰ Not filled          │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):
```
├───────────────────────────────────────────────────┤
│ Goal: 10 Minute Quran                             │
├───────────────────────────────────────────────────┤
│                                                    │
│ 10 Minute Recitation  [○Yes  ○No]                 │
│                                                    │
```

 

---


### Scenario 3: Admin Creates "English Practice" Goal (Standard - 2 Tasks)

**Admin Input:**
- Goal Name: `10 Minute English Practice`
- Description: `Practice speaking and listening`
- dataType: `boolean`
- Goal Category: `standard`
- Tasks:
  - Task 1: `Speaking Practice 5 min`
  - Task 2: `Listening Practice 5 min`
- Assign to: Selected Users

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: 10 Minute English Practice
Description: Practice speaking and listening

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

[STANDARD GOAL - TASKS]

Task 1:
- Name: Speaking Practice 5 min

Task 2:
- Name: Listening Practice 5 min

[COMMON SETTINGS]

Assign to Users:
- ○ Select All
- ✓ Ahmad
- ✓ Fatima
- ✓ Ibrahim
 
 Start Date: [📅 Select]
 End Date:   [📅 Select]
```

**What User Sees (Dashboard):**
- Badge: "📚 English Practice"
- Today: Not filled | Tasks shown: Speaking, Listening

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 📚 English Practice    │
│ Today: 0/2 tasks       │
│ ⏰ Speak ⏰ Listen     │
└────────────────────────┘
```

**What User Fills (Single Nightly Form):**
- Speaking Practice 5 min → `[○Yes  ○No]`
- Listening Practice 5 min → `[○Yes  ○No]`

### User Updates (Via Single Daily Entry Form):
```
├───────────────────────────────────────────────────┤
│ Goal: English Practice                            │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Speaking Practice 5 min  [○Yes  ○No]          │
│ 2. Listening Practice 5 min [○Yes  ○No]          │
│                                                    │
```

**After Submit:**
- Entries saved for the date
- Dashboard shows Today: Completed/Partial based on selections

 

---


### Scenario 4: Admin Creates "Gym Workout" Goal (Standard - 3 Tasks)

**Admin Input:**
- Goal Name: `Gym Workout`
- Description: `Complete daily workout`
- dataType: `multiselect` (if user selects exercises)
- Goal Category: `standard`
- Tasks:
  - Task 1: `Cardio 30 min`
  - Task 2: `Strength Training`
  - Task 3: `Stretching 10 min`
- Assign to: Selected Users

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: Gym Workout
Description: Complete daily workout

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

[STANDARD GOAL - TASKS]

Task 1:
- Name: Cardio 30 min

Task 2:
- Name: Strength Training

Task 3:
- Name: Stretching 10 min

[COMMON SETTINGS]

Assign to Users:
- ○ Select All
- ✓ Ahmad
- ✓ Ibrahim
 
 Start Date: [📅 Select]
 End Date:   [📅 Select]
```

**What User Sees (Dashboard):**
- Badge: "🏋️ Gym Workout"
- Today: Not filled

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 🏋️ Gym Workout         │
│ Today: 0/3 tasks       │
│ ⏰ Cardio ⏰ Strength  │
│ ⏰ Stretching          │
└────────────────────────┘
```

**What User Fills (Single Nightly Form):**
- Did you complete workout today? `[○Yes  ○No]`
- If Yes, which exercises?
  - `[ ] Cardio 30 min`
  - `[ ] Strength Training`
  - `[ ] Stretching 10 min`

### User Updates (Via Single Daily Entry Form):
```
├───────────────────────────────────────────────────┤
│ Goal: Gym Workout                                 │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you workout today? [○Yes  ○No]               │
│ If Yes, which exercises?                          │
│ [ ] Cardio 30 min                                 │
│ [ ] Strength Training                             │
│ [ ] Stretching 10 min                             │
│                                                    │
```

**After Submit:**
- Saves task-level completion
- Dashboard reflects completed tasks under this goal

 

---


### Scenario 5: Admin Creates "Daily Journal" Goal (Standard - Single Task)

**Admin Input:**
- Goal Name: `Daily Journal`
- Description: `Write daily reflection journal`
- dataType: `boolean`
- Goal Category: `standard`
- Tasks:
  - Task 1: `Write Journal Entry`
- Assign to: All Users

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 📝 Daily Journal       │
│ Today: 0/1 task        │
│ ⏰ Not filled          │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):
```
├───────────────────────────────────────────────────┤
│ Goal: Daily Journal                               │
├───────────────────────────────────────────────────┤
│                                                    │
│ Write Journal Entry  [○Yes  ○No]                 │
│                                                    │
```

**Admin Input:**
- Goal Name: `Daily Journal`
- Description: `Write daily reflection journal`
- Goal Category: `Standard Goal`
- Tasks:
  - Task 1: `Write Journal Entry`
- Assign to: All Users

**What User Sees (Dashboard):**
- Badge: "📝 Daily Journal"
- Today: Not filled

**What User Fills (Single Nightly Form):**
- Write Journal Entry → `[○Yes  ○No]`

**After Submit:**
- Dashboard shows Today: Completed if Yes

 

---


### Scenario 6: Admin Creates "Medication" Goal (Standard - Time-Specific Tasks)

**Admin Input:**
- Goal Name: `Medication Reminder`
- Description: `Take prescribed medication 3 times daily`
- dataType: `boolean`
- Goal Category: `standard`
- Tasks:
  - Task 1: `Morning Dose` (displayTime: 8:00 AM)
  - Task 2: `Afternoon Dose` (displayTime: 2:00 PM)
  - Task 3: `Night Dose` (displayTime: 10:00 PM)
- Assign to: Specific User(s)

**What User Sees (Dashboard):**
- Badge: "💊 Medication"
- Today: Not filled

**What User Fills (Single Nightly Form):**
- Morning Dose (8 AM) → `[○Yes  ○No]`
- Afternoon Dose (2 PM) → `[○Yes  ○No]`
- Night Dose (10 PM) → `[○Yes  ○No]`

**After Submit:**
- Saves each dose completion for the date
- Dashboard shows which doses were taken

 

---

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: Medication Reminder
Description: Take prescribed medication 3 times daily

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

[STANDARD GOAL - TASKS]

Task 1:
- Name: Morning Dose
- Time (Optional): 8:00 AM

Task 2:
- Name: Afternoon Dose
- Time (Optional): 2:00 PM

Task 3:
- Name: Night Dose
- Time (Optional): 10:00 PM

[COMMON SETTINGS]

Assign to Users:
- ○ Select All
- ✓ Aisha

Start Date: [📅 Select]
End Date:   [📅 Select]
```

---

### Medication Repeating Behavior (Intraday)

Medication occurs multiple times per day. Once the goal is created, its doses repeat every day with the same schedule.

**Admin Setup:**
- Define doses per day with display times: e.g., `Morning (8:00 AM)`, `Afternoon (2:00 PM)`, `Night (10:00 PM)`
- Recurrence: `Daily` (default V1); times are for display only (no reminders in MVP)

**Dashboard (Today):**
- Badge shows `Taken X/Y doses` for today
- Dose chips: `Morning`, `Afternoon`, `Night` with status: `Pending` (before nightly entry) → updates to `Taken/Missed` after nightly submission

**Single Nightly Form:**
- Confirm each dose: `[○Yes  ○No]` for all scheduled doses
- Optional note field per dose (future enhancement)

**Calendar & Weekly View:**
- Each day records per-dose status (Yes/No)
- Weekly tally shows `Days with all doses taken` (guidance only)

This keeps medication visible throughout the day and summarized at night without enforcement or notifications in V1.

## All Scenarios Together: One-Time Nightly Entry Flow

This flow shows how a user fills ONE form at night to cover all goals created by admin (Salah, English, Quran, Gym, Journal, Medication).

### Step-by-Step
1. Open app at night → Tap `Fill Today's Entry - All Goals`.
2. Select date if needed (default is today).
3. Fill each goal section sequentially:
   - Salah: Mark Yes/No for Fajr, Dhuhr, Asr, Maghrib, Isha.
   - English: Mark Yes/No for Speaking and Listening.
   - Quran: Type ayahs read (e.g., 25) OR check completed days. Per-task cards update with progress bars; completed day-cards drop out next time.
   - Gym: Choose Yes/No and select performed exercises.
   - Journal: Mark Yes/No.
   - Medication: Mark Yes/No for each dose.
4. Review quick summary at bottom (e.g., "6 goals updated").
5. Submit once → All entries saved for the date.

### Outcomes
- Dashboard badges update for all goals.
- Calendar view reflects the day's completion counts.
- Quran goal shows updated overall progress bar and hides fully completed day-cards on future dates.

---

## Technical Requirements (MVP)

### Data Storage
- Goal definitions (name, description, category, tasks)
- User assignments
- Daily logs with timestamps
- Task completion status (Yes/No for standard goals)
- Quran progress tracking (ayah count, task checkboxes)

### Key Calculations
- Daily completion status (completed vs not filled)
- Calendar view completion percentages
- Task count summaries
- Quran Planner: Total ayahs completed, progress percentage, tasks marked complete

---

### Repeating Tasks (Intraday)

Some goals (e.g., Medication) repeat multiple times per day. V1 handles them as time-labelled sub-tasks that recur daily.

**Data Model:**
- `goalCategory`: `Standard`
- `tasks`: array of dose objects `{ label, displayTime }`
- `recurrence`: `daily` (V1 default)
- `dailyLog`: stores per-dose `status: Yes|No` for a date

**UI Behavior:**
- Dashboard shows `Taken X/Y doses` + dose chips with status
- Nightly form provides Yes/No for each dose
- Calendar aggregates days with all doses taken (guidance only)

No alerts/reminders in V1; times are informational only.

## Future Enhancements (Not in V1.0)

These features will be added in future versions:

### Version 2.0:
- ✅ Weekly threshold system
- ✅ Duration/deadline management
- ✅ Progress monitoring with streak counter
- ✅ Reward & penalty system
- ✅ Notifications & reminders
- ✅ Analytics & insights dashboard

### Version 3.0:
- Multi-language support
- Social features (share progress)
- Custom reminder schedules per habit
- Integration with external APIs
- Offline mode support
- Data backup/restore

---

## MVP Summary

**What's Included in V1.0:**
✅ Admin can create Standard Goals (manual tasks)  
✅ Admin can create Quran Planner Goals (auto-generated tasks)  
✅ Admin can assign goals to multiple users  
✅ User dashboard with goal badges (view-only)  
✅ Single daily entry form at night (all goals in one form)  
✅ Date selector to backfill previous dates  
✅ Simple Yes/No task completion for standard goals  
✅ Checkbox task selection + custom ayah input for Quran goals  
✅ Progress bar tracking for Quran recitation  
✅ Calendar view showing completion history  
✅ Basic settings page  

**What's NOT in V1.0:**
❌ Weekly thresholds  
❌ Duration/deadline tracking  
❌ Progress monitoring/streaks  
❌ Reward & penalty system  
❌ Notifications & reminders  
❌ Analytics & insights  

This MVP focuses on the core functionality: **Admin creates goals → User fills one daily form → Track completion history**
