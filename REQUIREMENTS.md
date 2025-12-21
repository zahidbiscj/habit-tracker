# Habit Tracker App - System Requirements

## Overview
A simple daily habit tracking application with goal monitoring, rewards/penalties, and progress tracking.
### Scenario 2: Admin Creates "Quran Recitation" Goal (Quran Planner)

**Admin Input:**
- Goal Name: `Surah Baqarah Recitation`
- Description: `Complete Surah Baqarah 1-286 in 30 days`
- dataType: `boolean` (or `multiselect` if using checkboxes)
- Goal Category: `quran_planner`
- Tasks: 30 auto-generated (labels: Day 1, Day 2, ...)
- Assign to: All Users

**User Experience:**
- Sees "Surah Baqarah Recitation" badge on dashboard with progress bar
- At night, opens entry form
- Sees checkbox list of tasks (Day 1, Day 2, Day 3, etc.)
- Can check completed tasks OR enter custom ayah count
- Examples:
  - Read Day 1 & Day 2 → Check both boxes
  - Read 25 ayahs (2.5 days) → Enter "25" in custom field
  - Read ahead multiple days → Check multiple boxes
- Submits once
- Dashboard updates with progress bar showing ayah completion

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: Surah Baqarah Recitation
Description: Complete Surah Baqarah 1-286 in 30 days

Goal Category: ○ Standard Goal
               ● Quran Planner (Auto task generation)

[QURAN PLANNER - RANGE CONFIGURATION]

From:
- Surah: Baqarah
- Ayah: 1

To:
- Surah: Baqarah
- Ayah: 286

Number of Days to Complete: 30 days

Preview Auto-Generated Tasks:
- ✓ Task 1: Baqarah 1-10 (Day 1)
- ✓ Task 2: Baqarah 11-20 (Day 2)
- ... (30 tasks total)

[COMMON SETTINGS]

Assign to Users:
- ✓ All Users
 
 Start Date: [📅 Select]
 End Date:   [📅 Select]
```

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 📖 Quran Recitation    │
│ Progress: 25/286 ayah  │
│ ✓ Day 1 ✓ Day 2        │
│ ⏰ Day 3 (partial)     │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):
```
├───────────────────────────────────────────────────┤
│ Goal: Quran Recitation (Surah Baqarah)            │
├───────────────────────────────────────────────────┤
│                                                    │
│ Enter ayahs completed today: [____] ayahs         │
│                                                    │
│ [ ] Day 1: 1-10    [██████████] 10/10 ✓          │
│ [ ] Day 2: 11-20   [██████████] 10/10 ✓          │
│ [ ] Day 3: 21-30   [█████░░░░░] 5/10             │
│ [ ] Day 4: 31-40   [░░░░░░░░░░] 0/10             │
│                                                    │
```

 

---


---

## System Structure

### Goal → Tasks Hierarchy
- **Goal**: Top-level objective (e.g., "5 Times Salah", "Quran Recitation")
- **Tasks**: Sub-items under a goal that need to be completed
- Each task has Yes/No completion tracking
- **Goals have weekly threshold requirements** (e.g., must complete minimum 3 times per week)
- System tracks weekly completion and enforces threshold
- Failing to meet threshold triggers penalty tasks

### Goal Categories

#### Category 1: Standard Goals (Manual Task Creation)
- Admin creates goal
- Admin manually adds multiple tasks
- Each task tracks Yes/No completion
- Admin sets **weekly threshold** (minimum completions per week)
- **Examples**: 
  - 5 Times Salah (5 tasks: Fajr, Dhuhr, Asr, Maghrib, Isha) - Threshold: 5/week minimum
  - English Practice (2 tasks: Speaking, Listening) - Threshold: 3/week minimum

#### Category 2: Quran Planner Goals (Auto Task Creation)
- Admin creates goal with special "Quran Planner" type
- Admin specifies start/end Surah and Ayah range
- Admin sets number of days to complete
- Admin sets **weekly threshold** (minimum completions per week)
- System automatically divides and creates tasks
- **Example**: 
  - Surah Baqarah 1-286 to complete in 30 days
  - System creates 1 task per day (≈10 ayah per day)
  - Threshold: Must complete minimum 3 days per week
  - If user completes only 2 days in a week → Penalty task added

---

## Core Features

### 1. Goal & Task Management
- Admin can create goals with:
  - Goal Name
  - Description
  - Goal Category (Standard or Quran Planner)
  - **Weekly Threshold** (minimum completions required per week, e.g., 3/week, 5/week)
  - Duration (how long goal is active in weeks)
  - Reward conditions (e.g., meet threshold for 4 consecutive weeks)
  - **Penalty Task** (specific task assigned if threshold not met)
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

### 3. Progress Monitoring
- Real-time progress calculation
- Gap analysis: "You need X more minutes to achieve the goal"
- Streak counter (consecutive days completed)
- Weekly/Monthly summary reports

### 4. Reward & Penalty System
- Admin defines:
  - Reward threshold (e.g., 7 days streak, 90% completion rate)
  - Penalty threshold (e.g., 3 missed days, below 50% target)
- Automatic reward notifications
- Penalty alerts and warnings
- Points/badges system (optional)

### 5. Notifications & Reminders
- Daily reminder at specified time
- Approaching deadline alerts
- Motivational messages on streaks
- Warning alerts when falling behind

### 6. Analytics & Insights
- Completion rate per habit
- Best performing habits
- Time distribution charts
- Goal achievement trends
- Comparison: actual vs target

---

## User Roles

### Admin
- Create/edit/delete goals
- Assign goals to single or multiple users
- Set thresholds for rewards and penalties
- View all user data and progress
- Monitor user performance across assigned goals
- Configure system settings

### User
- View only assigned goals
- Mark Yes/No goals as complete
- Input numerical values for Number Field goals
- View personal progress for assigned goals only
- Receive notifications for assigned goals

---

## Dashboard Layout (2 Badges Per Row)

### Unified Badge Format (All Goal Types)

**Badge Structure** (applies to both Standard and Quran Planner goals):
```
┌────────────────────────┐
│ [Icon] Goal Name       │  ← Line 1: Icon + Goal Name
│ This Week: X/Y done    │  ← Line 2: This week's progress
│ Threshold: N/week min  │  ← Line 3: Required minimum per week
│ [Task Status]          │  ← Line 4: Today's task status
│ 🔥 Streak: N weeks     │  ← Line 5: Consecutive weeks met threshold
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
│ │ This Week: 5/7 done    │ │ This Week: 2/7 done    │  │
│ │ Threshold: 5/week min  │ │ Threshold: 3/week min  │  │
│ │ Today: ✓ Done (5/5)    │ │ Today: ✓ Done (2/2)    │  │
│ │ 🔥 Streak: 8 weeks     │ │ ⚠️ Need 1 more day     │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 📖 Quran Recitation    │ │ 🏋️ Gym Workout         │  │
│ │ This Week: 3/7 done    │ │ This Week: 4/7 done    │  │
│ │ Threshold: 3/week min  │ │ Threshold: 3/week min  │  │
│ │ Today: ✓ Done (1 task) │ │ Today: ✓ Done (3/3)    │  │
│ │ 🔥 Streak: 12 weeks    │ │ 🔥 Streak: 6 weeks     │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 💊 Medication          │ │ 📝 Daily Journal       │  │
│ │ This Week: 6/7 done    │ │ This Week: 4/7 done    │  │
│ │ Threshold: 7/week min  │ │ Threshold: 5/week min  │  │
│ │ Today: ⏰ Pending       │ │ Today: ⏰ Pending       │  │
│ │ ⚠️ Need today!         │ │ ⚠️ Need 1 more day     │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│              [📝 Fill Today's Entry - All Goals]        │
│                                                          │
│ Bottom Nav: [Home] [Calendar] [Reports] [Settings]     │
└─────────────────────────────────────────────────────────┘
```

**Dashboard Features**:
- **Badge Display**: View-only status showing all goals
- **Date Navigation**: Navigate between dates to view history
- **Single Entry Button**: User clicks one button to fill all goals at once
- **No Individual Badge Clicks**: Badges are informational only

---

**📋 Note:** For detailed Single Entry Form view showing all goals together, see:
- **"Complete System Flow: Admin Creates → User Fills at Night"** section below
- Shows unified admin form, how admin creates 6 different goals, and complete user entry form

---

## Weekly Threshold System Explanation

### How It Works:

**1. Weekly Tracking:**
- System tracks completions from Sunday to Saturday
- Each day user completes the goal = 1 count toward threshold
- Admin sets minimum completions needed per week (e.g., 3/week, 5/week)

**2. Threshold Examples:**
- **Quran Recitation**: Daily task, but threshold = 3/week minimum
  - User can do it any 3 days of the week
  - If completes only 2 days → Threshold NOT met
  - Penalty task added next week
  
- **On Time Salah**: Daily task, threshold = 5/week minimum
  - User must complete at least 5 days out of 7
  - If completes only 4 days → Threshold NOT met
  
- **English Practice**: Multiple tasks, threshold = 3/week minimum
  - User must complete all tasks on at least 3 days
  - Completing only 1 task doesn't count as "done for the day"

**3. Week End Logic (Every Saturday Night):**
- System counts total completions for the week (Sun-Sat)
- If count >= threshold → Success! Streak continues
- If count < threshold → **Penalty task automatically added**

**4. Penalty Task System:**
- Predefined by admin during goal creation
- Example: "Extra Quran Study - 30 minutes"
- Added as a new one-time task for the user
- Must be completed within next week
- Appears in user's daily entry form

**5. Streak Counting:**
- Streak counts consecutive weeks where threshold was met
- Missing threshold breaks the streak
- Reward given after N consecutive weeks (admin-defined)

---


### Admin Goal Creation Form
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
│ ( ) Quran Planner (Auto task generation)                │
│                                                          │
│ Weekly Threshold * (Minimum completions per week)       │
│ Must complete at least [3] times per week               │
│                                                          │
│ Duration (How long goal is active)                      │
│ Start Date: [📅 Select] End Date: [📅 Select]           │
│ Or Number of Weeks: [____] weeks                        │
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
│ │ Time (Optional): [__:__] [AM/PM]               │    │
│ │ [Remove]                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Task 2                                          │    │
│ │ Name: [_______________________________]        │    │
│ │ Time (Optional): [__:__] [AM/PM]               │    │
│ │ [Remove]                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [+ Add Another Task]                                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ [IF QURAN PLANNER SELECTED]                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Quran Range Configuration *                             │
│                                                          │
│ From:                                                   │
│ Surah: [Baqarah ▼] Ayah: [1]                           │
│                                                          │
│ To:                                                     │
│ Surah: [Baqarah ▼] Ayah: [20]                          │
│                                                          │
│ Number of Days to Complete: [3] days                    │
│                                                          │
│ Preview Auto-Generated Tasks:                           │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ✓ Task 1: Surah Baqarah 1-10                   │    │
│ │ ✓ Task 2: Surah Baqarah 11-20                  │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Regenerate Division]                                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Common Settings                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Assign to Users *                                       │
│ [✓] Select All                                          │
│ [ ] User 1 - Ahmad                                      │
│ [ ] User 2 - Fatima                                     │
│ [ ] User 3 - Ibrahim                                    │
│ [ ] User 4 - Aisha                                      │
│                                                          │
│ Reminder Time                                           │
│ [__:__] [AM/PM] [+ Add Another Reminder]                │
│                                                          │
│ ┌─── Reward & Penalty Settings ───────────────────┐    │
│ │                                                   │    │
│ │ Reward Condition                                 │    │
│ │ Meet threshold for [4] consecutive weeks         │    │
│ │ Reward message: [_________________________]      │    │
│ │                                                   │    │
│ │ Penalty Task (If threshold NOT met)             │    │
│ │ Task Name: [_________________________]           │    │
│ │ Description: [_________________________]         │    │
│ │                                                   │    │
│ │ Example: "Extra Quran Study - 30 minutes"       │    │
│ │ Note: This task will be added if user fails     │    │
│ │       to meet weekly threshold                   │    │
│ └──────────────────────────────────────────────────┘    │
│                                                          │
│ [Cancel] [Save & Assign Goal]                           │
└─────────────────────────────────────────────────────────┘
```



## Unified Format Details

### Badge Format (Threshold-Based):

**All Goals Use This Format:**
```
Line 1: [Icon] Goal Name
Line 2: Progress: 0/1 task
Line 3: ⏰ Not started
Line 4: Deadline: HH:MM AM/PM
Line 5: 🔥 Challenge: N days
```

### Consistency Benefits:
1. **Easy Scanning**: User can quickly identify progress at Line 2
2. **Predictable Layout**: Same structure for all goal types
3. **Status at a Glance**: Lines 3-4 show what's done/pending
4. **Motivation**: Challenge counter always visible at Line 5
5. **Works for Standard & Quran Planner**: Same format, different content

---





## Goal Detail Page
```
┌─────────────────────────────────────────────────────────┐
│ ← Back | Surah Mulk Reading | Edit | Delete             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Description: Read Surah Mulk daily before sleep         │
│ Type: Binary Completion                                 │
│ Deadline: 11:59 PM                                      │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Current Statistics                               │    │
│ │ • Current Streak: 🔥 15 days                     │    │
│ │ • Best Streak: 🏆 22 days                        │    │
│ │ • Completion Rate: 87% (26/30 days)             │    │
│ │ • Total Days Active: 45 days                    │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Calendar Heatmap (Last 30 Days)                 │    │
│ │                                                  │    │
│ │ Mon █ █ █ ░ █ █ █                               │    │
│ │ Tue █ █ ░ █ █ █ █                               │    │
│ │ Wed █ █ █ █ ░ █ █                               │    │
│ │ Thu █ █ █ █ █ █ ░                               │    │
│ │ Fri █ ░ █ █ █ █ █                               │    │
│ │ Sat █ █ █ █ █ ░ █                               │    │
│ │ Sun █ █ █ █ █ █ █                               │    │
│ │                                                  │    │
│ │ Legend: █ Done | ░ Missed                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Rewards & Achievements                          │    │
│ │ 🏅 7 Day Warrior (Earned 2 times)               │    │
│ │ ⭐ 30 Day Champion (In Progress: 26/30)         │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Progress Chart (Last 30 Days)                   │    │
│ │ [Line/Bar Chart showing completion trend]       │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Mark as Done Today] [View Full History]               │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Back navigation and action buttons
- Habit details section
- Statistics cards
- Calendar heatmap visualization
- Rewards/achievements section
- Progress trend chart
- Quick action buttons

---

### Calendar View Page
```
┌─────────────────────────────────────────────────────────┐
│ Calendar | ◀ December 2025 ▶ | [Today]                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Sun   Mon   Tue   Wed   Thu   Fri   Sat               │
│   1     2     3     4     5     6     7                 │
│  80%   90%   75%   85%   100%  60%   95%                │
│  🟢   🟢   🟡   🟢   🟢   🟡   🟢                       │
│                                                          │
│   8     9    10    11    12    13    14                │
│  90%   85%   90%   95%   50%   80%   90%                │
│  🟢   🟢   🟢   🟢   🟡   🟢   🟢                       │
│                                                          │
│  15    16    17    18    19    20    21                │
│  80%   --    --    --    --    --    --                 │
│  🟢                                                      │
│                                                          │
│  22    23    24    25    26    27    28                │
│  --    --    --    --    --    --    --                 │
│                                                          │
│  29    30    31                                         │
│  --    --    --                                         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Selected Date: December 15, 2025                        │
│                                                          │
│ Habits Completed: 4/5 (80%)                             │
│                                                          │
│ ✓ Surah Mulk Reading - Done at 10:30 PM                │
│ ✓ Quran Reading - 30 min logged                        │
│ ✓ Morning Exercise - Done at 6:00 AM                   │
│ ✓ Weight Update - 85 kg                                │
│ ✗ Evening Walk - Missed                                │
│                                                          │
│ Legend: 🟢 80%+ | 🟡 50-79% | 🔴 Below 50%             │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Month navigation
- Calendar grid with daily completion percentages
- Color-coded indicators
- Selected date details
- Daily habit list with status
- Legend for color codes

---
**Components**:
- Unified form for all goal types
- Goal category selector (Standard or Quran Planner)
- Frequency selector with custom option
- Duration settings with flexible options
- Conditional sections based on category:
  - Standard: Manual task entry with add/remove
  - Quran Planner: Surah/Ayah range selector with auto-preview
- User assignment with multi-select
- Reminder configuration
- Reward/penalty settings
- Form validation and preview

---

### Reports & Analytics Page
```
┌─────────────────────────────────────────────────────────┐
│ Reports | [Last 7 Days ▼] | [All Habits ▼] | Export    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Overall Summary                                  │    │
│ │                                                  │    │
│ │ Average Completion Rate: 85%                    │    │
│ │ Total Active Habits: 5                          │    │
│ │ Best Performing: Surah Mulk Reading (100%)      │    │
│ │ Needs Attention: Evening Walk (40%)             │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Completion Trend (Last 7 Days)                  │    │
│ │                                                  │    │
│ │  100% ┤     ●───●───●───●                       │    │
│ │   80% ┤ ●───●                                   │    │
│ │   60% ┤                                         │    │
│ │   40% ┤                                         │    │
│ │   20% ┤                                         │    │
│ │    0% └─────────────────────────                │    │
│ │       Mon Tue Wed Thu Fri Sat Sun              │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Habits Breakdown (Pie Chart)                    │    │
│ │                                                  │    │
│ │         ╱───────╲                               │    │
│ │        │    █    │                              │    │
│ │         ╲───────╱                               │    │
│ │                                                  │    │
│ │ • Surah Mulk (100%)                             │    │
│ │ • Quran Reading (85%)                           │    │
│ │ • Exercise (90%)                                │    │
│ │ • Weight (75%)                                  │    │
│ │ • Walk (40%)                                    │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Detailed Habit Stats                            │    │
│ │                                                  │    │
│ │ Surah Mulk Reading                              │    │
│ │ ████████████████████ 100% | Streak: 15         │    │
│ │                                                  │    │
│ │ Quran Reading                                   │    │
│ │ █████████████████░░░ 85% | Avg: 28 min/day     │    │
│ │                                                  │    │
│ │ Morning Exercise                                │    │
│ │ ██████████████████░░ 90% | Streak: 12          │    │
│ │                                                  │    │
│ │ Weight Loss                                     │    │
│ │ ███████████████░░░░░ 75% | Lost: 4 kg          │    │
│ │                                                  │    │
│ │ Evening Walk                                    │    │
│ │ ████████░░░░░░░░░░░░ 40% | Streak: 0           │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Rewards Earned: 3 | Penalties: 1                │    │
│ │ 🏅 7 Day Warrior x2                             │    │
│ │ ⭐ Perfect Week x1                              │    │
│ │ ⚠️ Inconsistent Week x1                         │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Download PDF] [Download CSV] [Share]                  │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Date range selector
- Habit filter dropdown
- Export button
- Summary statistics card
- Line chart for trend analysis
- Pie chart for habit distribution
- Detailed progress bars per habit
- Rewards and penalties summary
- Export/share buttons

---

## Complete System Flow: Admin Creates → User Fills at Night

This section shows the unified admin form, how admin creates different goal types, and how ALL goals appear together in ONE single entry form that user fills at night.

---

## PART 1: Admin Goal Creation Form (Unified for All Types)

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
│ ( ) Quran Planner (Auto task generation)                │
│                                                          │
│ Weekly Threshold * (Minimum completions per week)       │
│ Must complete at least [3] days per week               │
│                                                          │
│ Duration (How long goal is active)                      │
│ Start Date: [📅 Select] End Date: [📅 Select]           │
│ Or Number of Weeks: [____] weeks                        │
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
│ │ Time (Optional): [__:__] [AM/PM]               │    │
│ │ [Remove]                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Task 2                                          │    │
│ │ Name: [_______________________________]        │    │
│ │ Time (Optional): [__:__] [AM/PM]               │    │
│ │ [Remove]                                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [+ Add Another Task]                                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ [IF QURAN PLANNER SELECTED]                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Quran Range Configuration *                             │
│                                                          │
│ From:                                                   │
│ Surah: [Baqarah ▼] Ayah: [1]                           │
│                                                          │
│ To:                                                     │
│ Surah: [Baqarah ▼] Ayah: [286]                         │
│                                                          │
│ Number of Days to Complete: [30] days                   │
│                                                          │
│ Preview Auto-Generated Tasks:                           │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ✓ Task 1: Surah Baqarah 1-10                   │    │
│ │ ✓ Task 2: Surah Baqarah 11-20                  │    │
│ │ ✓ Task 3: Surah Baqarah 21-30                  │    │
│ │ ... (30 tasks total)                           │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Regenerate Division]                                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ Common Settings                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Assign to Users *                                       │
│ [✓] Select All                                          │
│ [ ] User 1 - Ahmad                                      │
│ [ ] User 2 - Fatima                                     │
│ [ ] User 3 - Ibrahim                                    │
│ [ ] User 4 - Aisha                                      │
│                                                          │
│ Reminder Time                                           │
│ [__:__] [AM/PM] [+ Add Another Reminder]                │
│                                                          │
│ ┌─── Reward & Penalty Settings ───────────────────┐    │
│ │                                                   │    │
│ │ Reward Condition                                 │    │
│ │ Meet threshold for [4] consecutive weeks         │    │
│ │ Reward message: [_________________________]      │    │
│ │                                                   │    │
│ │ Penalty Task (If threshold NOT met)             │    │
│ │ Task Name: [_________________________]           │    │
│ │ Description: [_________________________]         │    │
│ │                                                   │    │
│ │ Example: "Extra Quran Study - 30 minutes"       │    │
│ │ Note: This task will be added if user fails     │    │
│ │       to meet weekly threshold                   │    │
│ └──────────────────────────────────────────────────┘    │
│                                                          │
│ [Cancel] [Save & Assign Goal]                           │
└─────────────────────────────────────────────────────────┘
```

---

## PART 2: Admin Creates 6 Different Goals

### Goal 1: On Time Salah (Multiple Tasks - Daily)

**Admin fills the form:**
- Goal Name: `On Time Salah`
- Description: `Complete all 5 daily prayers on time`
- Goal Category: `● Standard Goal`
- Weekly Threshold: `5 times per week minimum` (must complete all 5 prayers on at least 5 days/week)
- Duration: Start: `Dec 1, 2025` | Ongoing (weeks)
- Tasks:
  - Task 1: `Fajr` (Time: `5:30 AM`)
  - Task 2: `Dhuhr` (Time: `1:00 PM`)
  - Task 3: `Asr` (Time: `4:30 PM`)
  - Task 4: `Maghrib` (Time: `6:45 PM`)
  - Task 5: `Isha` (Time: `8:30 PM`)
- Assign to: `✓ All Users`
- Reminders: `5:00 AM, 12:30 PM, 4:00 PM, 6:15 PM, 8:00 PM`
- Reward: `Meet threshold for 4 consecutive weeks` | Message: `"🎉 Salah Champion!"`
- Penalty Task: `Extra Tahajjud Prayer - 15 minutes` (added if threshold not met)

---

### Goal 2: English Practice (2 Tasks)

**Admin fills the form:**
- Goal Name: `10 Minute English Practice`
- Description: `Practice speaking and listening regularly`
- Goal Category: `● Standard Goal`
- Weekly Threshold: `3 times per week minimum` (must complete both tasks on at least 3 days/week)
- Duration: `8 weeks` (Dec 1 - Jan 26, 2026)
- Tasks:
  - Task 1: `Speaking Practice 5 min`
  - Task 2: `Listening Practice 5 min`
- Assign to: `Ahmad, Fatima, Ibrahim`
- Reminders: `7:00 PM`
- Reward: `Meet threshold for 6 consecutive weeks` | Message: `"⭐ English Learning Champion!"`
- Penalty Task: `Watch English Movie with Subtitles - 1 hour` (added if threshold not met)

---

### Goal 3: Quran Recitation (Quran Planner - Auto Tasks)

**Admin fills the form:**
- Goal Name: `Surah Baqarah Recitation`
- Description: `Complete Surah Baqarah 1-286 in 30 days`
- Goal Category: `● Quran Planner`
- Weekly Threshold: `3 times per week minimum` (must complete daily task on at least 3 days/week)
- Duration: `30 days` (approx 4 weeks)
- Quran Range:
  - From: `Surah Baqarah, Ayah 1`
  - To: `Surah Baqarah, Ayah 286`
  - Days: `30`
  - System generates: `30 daily tasks (~10 ayah per day)`
- Assign to: `✓ All Users`
- Reminders: `9:00 AM, 8:00 PM`
- Reward: `Meet threshold for 4 consecutive weeks` | Message: `"🌟 Surah Baqarah Journey Complete!"`
- Penalty Task: `Extra Quran Study - Read Tafsir 30 minutes` (added if threshold not met)

---

### Goal 4: Gym Workout (3 Tasks)

**Admin fills the form:**
- Goal Name: `Gym Workout`
- Description: `Complete gym sessions regularly`
- Goal Category: `● Standard Goal`
- Weekly Threshold: `3 times per week minimum` (must complete all 3 tasks on at least 3 days/week)
- Duration: Ongoing (weeks)
- Tasks:
  - Task 1: `Cardio 30 min`
  - Task 2: `Strength Training`
  - Task 3: `Stretching 10 min`
- Assign to: `Ahmad, Ibrahim`
- Reminders: `6:00 AM`
- Reward: `Meet threshold for 8 consecutive weeks` | Message: `"💪 Fitness Champion!"`
- Penalty Task: `100 Push-ups + 100 Squats at Home` (added if threshold not met)

---

### Goal 5: Daily Journal (Single Task)

**Admin fills the form:**
- Goal Name: `Daily Journal`
- Description: `Write daily reflection journal`
- Goal Category: `● Standard Goal`
- Weekly Threshold: `5 times per week minimum` (must write journal on at least 5 days/week)
- Duration: `8 weeks`
- Tasks:
  - Task 1: `Write Journal Entry`
- Assign to: `✓ All Users`
- Reminders: `9:00 PM`
- Reward: `Meet threshold for 8 consecutive weeks` | Message: `"📖 Journal Master!"`
- Penalty Task: `Write detailed weekly reflection - 500 words` (added if threshold not met)

---

### Goal 6: Medication (Time-Specific Tasks)

**Admin fills the form:**
- Goal Name: `Medication Reminder`
- Description: `Take prescribed medication 3 times daily`
- Goal Category: `● Standard Goal`
- Weekly Threshold: `7 times per week minimum` (must take medication every single day)
- Duration: Ongoing (weeks)
- Tasks:
  - Task 1: `Morning Dose` (Time: `8:00 AM`)
  - Task 2: `Afternoon Dose` (Time: `2:00 PM`)
  - Task 3: `Night Dose` (Time: `10:00 PM`)
- Assign to: `Aisha`
- Reminders: `7:45 AM, 1:45 PM, 9:45 PM`
- Reward: `Meet threshold for 4 consecutive weeks` | Message: `"💊 Perfect Medication Adherence!"`
- Penalty Task: `Schedule Doctor Consultation` (added if threshold not met)

---

## PART 3: User's Single Entry Form at Night (ALL 6 Goals Together)

### User opens app at night (10:00 PM) and sees ONE form with ALL goals:

**Note**: User completes all 22 tasks (5+2+1+3+3+1+3 from 6 goals) in one submission.

```
┌───────────────────────────────────────────────────┐
│ ✕ | Daily Entry Form                              │
├───────────────────────────────────────────────────┤
│                                                    │
│ Select Date: [📅 December 16, 2025 ▼]             │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 1: On Time Salah                             │
│ Weekly Progress: 5/7 done | Need 5/week min       │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you complete all 5 prayers today?             │
│                                                    │
│ 1. Fajr                  [●Yes  ○No]              │
│ 2. Dhuhr                 [●Yes  ○No]              │
│ 3. Asr                   [●Yes  ○No]              │
│ 4. Maghrib               [○Yes  ●No]              │
│ 5. Isha                  [○Yes  ●No]              │
│                                                    │
│ ℹ️ All 5 must be Yes to count toward threshold    │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 2: English Practice                          │
│ Weekly Progress: 2/7 done | Need 3/week min       │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Speaking Practice 5 min   [●Yes  ○No]          │
│ 2. Listening Practice 5 min  [●Yes  ○No]          │
│                                                    │
│ ℹ️ Both must be Yes to count toward threshold     │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 3: Quran Recitation (Surah Baqarah)         │
│ Weekly Progress: 2/7 done | Need 3/week min       │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you recite Quran today?                       │
│    [●Yes  ○No]                                    │
│                                                    │
│ Note: Today's portion is Day 16 of 30 (~10 ayah)  │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 4: Gym Workout                               │
│ Weekly Progress: 2/7 done | Need 3/week min       │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you complete workout today?  [●Yes  ○No]      │
│                                                    │
│ If Yes, which exercises?                          │
│ [✓] Cardio 30 min                                 │
│ [✓] Strength Training                             │
│ [✓] Stretching 10 min                             │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 5: Daily Journal                             │
│ Weekly Progress: 4/7 done | Need 5/week min       │
├───────────────────────────────────────────────────┤
│                                                    │
│ Write Journal Entry      [●Yes  ○No]              │
│                                                    │
├───────────────────────────────────────────────────┤
│ Goal 6: Medication                                │
│ Weekly Progress: 6/7 done | Need 7/week min       │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you take all doses today?                     │
│                                                    │
│ 1. Morning Dose (8 AM)   [●Yes  ○No]              │
│ 2. Afternoon Dose (2 PM) [●Yes  ○No]              │
│ 3. Night Dose (10 PM)    [●Yes  ○No]              │
│                                                    │
│ ℹ️ All 3 must be Yes to count toward threshold    │
│                                                    │
├───────────────────────────────────────────────────┤
│                                                    │
│ 📊 Summary: 22 tasks across 6 goals               │
│ This week: Working toward thresholds              │
│                                                    │
│        [Cancel] [Save All Entries]                │
│                                                    │
└───────────────────────────────────────────────────┘
```

### Key Points About This Single Entry Form:
1. **One Form, All Goals**: User sees all 6 goals in one scrollable form
2. **Fills Once at Night**: User opens app at night (e.g., 10 PM) and fills everything
3. **Date Selector at Top**: Can fill for today or backfill previous dates
4. **Weekly Progress Shown**: Each goal shows "X/7 done | Need N/week min"
5. **Simple Yes/No**: Every task is just a radio button
6. **One Submit Button**: Single "Save All Entries" saves everything
7. **Real-time Threshold Tracking**: User sees if they're on track to meet threshold
8. **Clear Completion Rules**: Info notes explain when a day counts toward threshold

### What Happens After User Clicks "Save All Entries":

**1. Immediate (After Submit):**
- System saves all 22 task entries for December 16, 2025
- Checks each goal's completion:
  - Goal 1 (Salah): Only 3/5 prayers = NOT counted toward weekly threshold
  - Goal 2 (English): Both tasks done = ✅ Counts! Now 3/7 this week
  - Goal 3 (Quran): Done = ✅ Counts! Now 3/7 this week
  - Goal 4 (Gym): All 3 done = ✅ Counts! Now 3/7 this week
  - Goal 5 (Journal): Done = ✅ Counts! Now 5/7 this week
  - Goal 6 (Medication): All 3 done = ✅ Counts! Now 7/7 this week
- Dashboard badges update showing new weekly progress
- User returns to dashboard

**2. During the Week:**
- User fills form each night
- Weekly counters increment when all tasks for a goal are completed
- Badges show real-time progress: "This Week: 4/7 done"
- Warning appears if user is behind threshold

**3. At Week End (Every Saturday 11:59 PM):**

System automatically checks each goal:

**Goal 1 - Salah (5/7 done, threshold 5/week):** ✅ MET → Streak continues  
**Goal 2 - English (3/7 done, threshold 3/week):** ✅ MET → Streak continues  
**Goal 3 - Quran (2/7 done, threshold 3/week):** ❌ NOT MET → **Penalty added!**  
  - Adds: "Extra Quran Study - Read Tafsir 30 minutes" for next week
**Goal 4 - Gym (4/7 done, threshold 3/week):** ✅ MET → Streak continues  
**Goal 5 - Journal (5/7 done, threshold 5/week):** ✅ MET → Streak continues  
**Goal 6 - Medication (7/7 done, threshold 7/week):** ✅ MET → Streak continues  

**4. Next Week Starts (Sunday):**
- Weekly counters reset to 0/7 for new week
- User sees penalty task in their entry form:
  ```
  ├───────────────────────────────────────────────┤
  │ 🚨 PENALTY TASK                                │
  ├───────────────────────────────────────────────┤
  │                                                │
  │ Extra Quran Study - Read Tafsir 30 minutes    │
  │ Reason: Did not meet threshold last week      │
  │                                                │
  │ Complete this task:  [○Yes  ○No]              │
  │                                                │
  ├───────────────────────────────────────────────┤
  ```
- Penalty task must be completed to remove it
- Regular goals continue as normal

---

## Individual Scenario Details

Below are detailed breakdowns of each scenario showing admin input and user experience with the **threshold-based system**.

---

## Threshold System & Penalty Flow Example

### Example: User with Quran Recitation Goal

**Week 1 (Dec 1-7):**
- Admin Set: Threshold = 3 times per week minimum
- User completes: Sunday ✓, Tuesday ✓, Friday ✓
- **Result**: 3/7 = Threshold MET ✅
- Streak: 1 week
- No penalty

**Week 2 (Dec 8-14):**
- User completes: Monday ✓, Thursday ✓
- **Result**: 2/7 = Threshold NOT MET ❌
- Streak: Broken (resets to 0)
- **Penalty Triggered**: System adds "Extra Quran Study - Read Tafsir 30 minutes" to user's task list for Week 3

**Week 3 (Dec 15-21):**
- User sees their normal daily task PLUS penalty task
- User completes normal task: Sunday ✓, Wednesday ✓, Friday ✓, Saturday ✓
- **Result**: 4/7 = Threshold MET ✅
- Streak: 1 week (restarted)
- Penalty task still visible until completed

**Penalty Task Completion:**
- Penalty tasks appear as separate one-time tasks
- Must be completed within the week
- Completing penalty task removes it from list
- Does NOT count toward goal's weekly threshold
- Failure to complete penalty = Another penalty may be added

**Reward After Consecutive Weeks:**
- If user meets threshold for 4 consecutive weeks → Reward unlocked
- Admin-defined reward message appears
- Badge/achievement awarded

---

### Settings Page
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
│ Notifications                                           │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [✓] Enable daily reminders                      │    │
│ │ [✓] Enable achievement notifications            │    │
│ │ [✓] Enable penalty warnings                     │    │
│ │ [✓] Enable motivational messages                │    │
│ │ Default reminder time: [__:__] [AM/PM]          │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Preferences                                             │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Theme: ( ) Light ( ) Dark ( ) Auto              │    │
│ │ Start of week: [Sunday ▼]                       │    │
│ │ Date format: [MM/DD/YYYY ▼]                     │    │
│ │ Time format: [12 Hour ▼]                        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Data Management                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [Backup Data]                                   │    │
│ │ [Restore Data]                                  │    │
│ │ [Export All Data]                               │    │
│ │ [Clear All Data] ⚠️                             │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Admin Settings (Admin Only)                            │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [Manage Users]                                  │    │
│ │ [View All Habits]                               │    │
│ │ [System Configuration]                          │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ About                                                   │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Version: 1.0.0                                  │    │
│ │ [Help & Documentation]                          │    │
│ │ [Privacy Policy]                                │    │
│ │ [Terms of Service]                              │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Logout]                                                │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Profile section with picture and info
- Notification toggles and settings
- Preference controls
- Data management buttons
- Admin-only section (conditional)
- About and legal links
- Logout button

---

### Notifications/Alerts Modal
```
┌───────────────────────────────────────┐
│ 🎉 Congratulations!                   │
├───────────────────────────────────────┤
│                                       │
│ You've completed 7 consecutive days   │
│ of "Surah Mulk Reading"!              │
│                                       │
│ 🏅 Reward Unlocked: 7 Day Warrior     │
│                                       │
│ Keep up the great work!               │
│                                       │
│         [Awesome!] [View Details]     │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ ⚠️ Warning                            │
├───────────────────────────────────────┤
│                                       │
│ You've missed "Evening Walk" for      │
│ 3 consecutive days.                   │
│                                       │
│ ⚠️ Penalty Applied: Inconsistent Week │
│                                       │
│ Let's get back on track!              │
│                                       │
│         [Dismiss] [Mark Done Now]     │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ 💡 Reminder                           │
├───────────────────────────────────────┤
│                                       │
│ Time to complete your daily habits!   │
│                                       │
│ Pending today:                        │
│ • Surah Mulk Reading (by 11:59 PM)   │
│ • Quran Reading (20 min remaining)   │
│                                       │
│         [Snooze 30 min] [Open App]    │
└───────────────────────────────────────┘
```

**Components**:
- Different modal types (success, warning, reminder)
- Icon indicators
- Message content
- Action buttons
- Dismissible overlays

---

## Technical Requirements

### Data Storage
- Habit definitions
- Daily logs with timestamps
- User progress history
- Reward/penalty records

### Key Calculations
- Completion percentage
- Streak counting
- Gap to goal (remaining time/value)
- Reward/penalty triggering
- Attendance marking logic

---

## Future Enhancements (Optional)
- Multi-user support
- Social features (share progress)
- Custom reminder schedules per habit
- Integration with external APIs (fitness trackers)
- Offline mode support
- Data backup/restore

---

---

---

## Complete Scenario Flows

This section shows exactly what admin creates and what users see in different scenarios.

---

## Scenario 1: Daily Multi-Task Goal (On Time Salah)

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: On Time Salah
Description: Complete all 5 daily prayers on time

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

Frequency: ● Daily
           ○ Twice a Week
           ○ Weekly
           ○ Custom

Duration:
- Start Date: December 1, 2025
- End Date: (No end date - Ongoing)
- Or Number of Days: (Not specified)

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
- ✓ Select All

Reminder Time:
- 5:00 AM
- 12:30 PM
- 4:00 PM
- 6:15 PM
- 8:00 PM

Reward & Penalty Settings:
- Reward Threshold: Complete all tasks for 7 consecutive days
- Reward Message: "🎉 7 Day Salah Champion! May Allah accept your prayers."
- Penalty Threshold: Miss all tasks for 3 consecutive days
- Penalty Message: "⚠️ Don't give up! Get back on track with your prayers."
```

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 🕌 On Time Salah       │
│ Progress: 3/5 tasks    │
│ ✓ Fajr ✓ Dhuhr ✓ Asr  │
│ ⏰ Maghrib ⏰ Isha      │
│ 🔥 Challenge: 12 days  │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):

User clicks "Fill Today's Entry" button at night and sees this goal in the form:

```
├───────────────────────────────────────────────────┤
│ Goal 1: On Time Salah                             │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Fajr - [●Yes  ○No]                            │
│ 2. Dhuhr - [●Yes  ○No]                           │
│ 3. Asr - [●Yes  ○No]                             │
│ 4. Maghrib - [●Yes  ○No]                         │
│ 5. Isha - [●Yes  ○No]                            │
│                                                    │
```

**User fills all 5 tasks with simple Yes/No, then continues to next goal in same form.**

---

## Scenario 2: Frequency-Based Goal (English Practice - Twice a Week)

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: 10 Minute English Practice
Description: Practice speaking and listening minimum twice a week

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

Frequency: ○ Daily
           ● Twice a Week
           ○ Weekly
           ○ Custom

Duration:
- Start Date: December 16, 2025
- End Date: December 30, 2025
- Or Number of Days: 14 days

[STANDARD GOAL - TASKS]

Task 1:
- Name: Speaking Practice 5 min
- Time (Optional): (Not specified)

Task 2:
- Name: Listening Practice 5 min
- Time (Optional): (Not specified)

[COMMON SETTINGS]

Assign to Users:
- ○ Select All
- ✓ User 1 - Ahmad
- ✓ User 2 - Fatima
- ✓ User 3 - Ibrahim
- ○ User 4 - Aisha

Reminder Time:
- 7:00 PM

Reward & Penalty Settings:
- Reward Threshold: Complete all tasks for 14 consecutive days (2 weeks, twice per week)
- Reward Message: "⭐ English Learning Champion! Your consistency is impressive."
- Penalty Threshold: Miss all tasks for 7 consecutive days (1 week)
- Penalty Message: "⚠️ Keep up your English practice! Don't break the routine."
```

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 📚 English Practice    │
│ Progress: 1/2 days     │
│ ✓ Mon ⏰ Need 1 more   │
│ Tasks: ✓ Speak ✓ Listen│
│ 🔥 Challenge: 14 days  │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):

User clicks "Fill Today's Entry" button at night and sees this goal in the form:

```
├───────────────────────────────────────────────────┤
│ Goal 2: English Practice                          │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Speaking Practice 5 min - [●Yes  ○No]         │
│ 2. Listening Practice 5 min - [●Yes  ○No]        │
│                                                    │
```

**User marks both tasks as Yes/No. System tracks this as one day of completion for the week.**

---

## Scenario 3: Quran Planner with Auto Task Generation

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: Surah Baqarah Recitation
Description: Complete Surah Baqarah 1-20 in 3 days

Goal Category: ○ Standard Goal
               ● Quran Planner (Auto task generation)

Frequency: ● Daily
           ○ Twice a Week
           ○ Weekly
           ○ Custom

Duration:
- Start Date: December 16, 2025
- End Date: (Auto-calculated based on days)
- Or Number of Days: 3 days

[QURAN PLANNER - RANGE CONFIGURATION]

From:
- Surah: Baqarah
- Ayah: 1

To:
- Surah: Baqarah
- Ayah: 20

Number of Days to Complete: 3 days

Preview Auto-Generated Tasks:
- ✓ Task 1: Surah Baqarah 1-7 (Day 1)
- ✓ Task 2: Surah Baqarah 8-14 (Day 2)
- ✓ Task 3: Surah Baqarah 15-20 (Day 3)

[COMMON SETTINGS]

Assign to Users:
- ✓ Select All

Reminder Time:
- 9:00 AM
- 8:00 PM

Reward & Penalty Settings:
- Reward Threshold: Complete all tasks for 3 consecutive days
- Reward Message: "🌟 Surah Baqarah Completed! May Allah reward you."
- Penalty Threshold: Miss all tasks for 1 consecutive day
- Penalty Message: "⚠️ Continue your Quran journey. Don't miss today's recitation."
```

### What User Sees in Dashboard - Day 1 (Badge View):
```
┌────────────────────────┐
│ 📖 Quran Recitation    │
│ Progress: 0/3 tasks    │
│ ⏰ Baqarah 1-7 (Day 1) │
│ 🔒 Baqarah 8-14        │
│ 🔥 Challenge: 3 days   │
└────────────────────────┘
```

### User Updates Day 1 (Via Single Daily Entry Form):

User clicks "Fill Today's Entry" button at night and sees this goal in the form:

```
├───────────────────────────────────────────────────┤
│ Goal 3: Quran Recitation                          │
├───────────────────────────────────────────────────┤
│                                                    │
│ Today's Task: Surah Baqarah 1-7 (Day 1)          │
│    [●Yes  ○No]                                    │
│                                                    │
```

**User marks as Yes/No. System automatically unlocks Day 2 task for tomorrow.**

### What User Sees in Dashboard - Day 2 (Badge View):
```
┌────────────────────────┐
│ 📖 Quran Recitation    │
│ Progress: 1/3 tasks    │
│ ✓ Baqarah 1-7 (Day 1)  │
│ ⏰ Baqarah 8-14 (Day 2)│
│ 🔥 Challenge: 3 days   │
└────────────────────────┘
```

### What User Sees in Dashboard - Completed (Badge View):
```
┌────────────────────────┐
│ 📖 Quran Recitation    │
│ Progress: 3/3 tasks    │
│ ✓ Baqarah 1-7          │
│ ✓ Baqarah 8-14         │
│ 🔥 Challenge: 3 days ✓ │
└────────────────────────┘
```

---

## Scenario 4: Weekly Goal with Multiple Tasks

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: Gym Workout
Description: Complete 3 gym sessions per week

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

Frequency: ○ Daily
           ○ Twice a Week
           ● Weekly (3 times per week)
           ○ Custom

Duration:
- Start Date: December 1, 2025
- End Date: (No end date - Ongoing)
- Or Number of Days: (Not specified)

[STANDARD GOAL - TASKS]

Task 1:
- Name: Cardio 30 min
- Time (Optional): (Not specified)

Task 2:
- Name: Strength Training
- Time (Optional): (Not specified)

Task 3:
- Name: Stretching 10 min
- Time (Optional): (Not specified)

[COMMON SETTINGS]

Assign to Users:
- ○ Select All
- ✓ User 1 - Ahmad
- ○ User 2 - Fatima
- ✓ User 3 - Ibrahim
- ○ User 4 - Aisha

Reminder Time:
- 6:00 AM (Mon, Wed, Fri)

Reward & Penalty Settings:
- Reward Threshold: Complete all tasks for 28 consecutive days (3 sessions per week for 4 weeks)
- Reward Message: "💪 Fitness Champion! 4 weeks of consistent workouts!"
- Penalty Threshold: Miss all tasks for 14 consecutive days (less than 2 sessions per week)
- Penalty Message: "⚠️ Your fitness goals need you! Get back to the gym."
```

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 🏋️ Gym Workout         │
│ Progress: 2/3 days     │
│ ✓ Mon ✓ Wed ⏰ Fri    │
│ Tasks: All 3 done      │
│ 🔥 Challenge: 28 days  │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):

User clicks "Fill Today's Entry" button at night and sees this goal in the form:

```
├───────────────────────────────────────────────────┤
│ Goal 4: Gym Workout                               │
├───────────────────────────────────────────────────┤
│                                                    │
│ Did you workout today? [●Yes  ○No]                │
│                                                    │
│ If Yes, which exercises?                          │
│ [✓] Cardio 30 min                                 │
│ [✓] Strength Training                             │
│ [✓] Stretching 10 min                             │
│                                                    │
```

**User marks yes and checks completed exercises. System counts as one workout session for the week.**

---

## Scenario 5: Single Task Goal (Daily Journal)

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: Daily Journal
Description: Write daily reflection journal

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

Frequency: ● Daily
           ○ Twice a Week
           ○ Weekly
           ○ Custom

Duration:
- Start Date: December 1, 2025
- End Date: December 30, 2025
- Or Number of Days: 30 days

[STANDARD GOAL - TASKS]

Task 1:
- Name: Write Journal Entry
- Time (Optional): (Not specified)

[COMMON SETTINGS]

Assign to Users:
- ✓ Select All

Reminder Time:
- 9:00 PM

Reward & Penalty Settings:
- Reward Threshold: Complete all tasks for 30 consecutive days
- Reward Message: "📖 30 Day Journal Streak! Your reflection journey is inspiring."
- Penalty Threshold: Miss all tasks for 3 consecutive days
- Penalty Message: "⚠️ Your journal misses you! Take a moment to reflect today."
```

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 📝 Daily Journal       │
│ Progress: 0/1 task     │
│ ⏰ Not started         │
│ Deadline: 11:59 PM     │
│ 🔥 Challenge: 5 days   │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):

User clicks "Fill Today's Entry" button at night and sees this goal in the form:

```
├───────────────────────────────────────────────────┤
│ Goal 5: Daily Journal                             │
├───────────────────────────────────────────────────┤
│                                                    │
│ Write Journal Entry - [●Yes  ○No]                 │
│                                                    │
```

**User marks as Yes/No. Simple single question.**

---

## Scenario 6: Medication Tracking (Time-Specific Tasks)

### What Admin Creates:
```
[ADMIN FORM INPUT]

Goal Name: Medication Reminder
Description: Take prescribed medication 3 times daily

Goal Category: ● Standard Goal (Manual task creation)
               ○ Quran Planner

Frequency: ● Daily
           ○ Twice a Week
           ○ Weekly
           ○ Custom

Duration:
- Start Date: December 1, 2025
- End Date: (No end date - Ongoing)
- Or Number of Days: (Not specified)

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
- ○ User 1 - Ahmad
- ○ User 2 - Fatima
- ○ User 3 - Ibrahim
- ✓ User 4 - Aisha

Reminder Time:
- 7:45 AM
- 1:45 PM
- 9:45 PM

Reward & Penalty Settings:
- Reward Threshold: Complete all tasks for 30 consecutive days
- Reward Message: "💊 30 Days of Perfect Medication Adherence! Keep it up!"
- Penalty Threshold: Miss all tasks for 2 consecutive days
- Penalty Message: "⚠️ Health is important! Don't forget your medication."
```

### What User Sees in Dashboard (Badge View):
```
┌────────────────────────┐
│ 💊 Medication          │
│ Progress: 2/3 tasks    │
│ ✓ Morning ✓ Afternoon  │
│ ⏰ Night (10 PM)       │
│ 🔥 Challenge: 30 days  │
└────────────────────────┘
```

### User Updates (Via Single Daily Entry Form):

User clicks "Fill Today's Entry" button at night and sees this goal in the form:

```
├───────────────────────────────────────────────────┤
│ Goal 6: Medication                                │
├───────────────────────────────────────────────────┤
│                                                    │
│ 1. Morning Dose - [●Yes  ○No]                     │
│ 2. Afternoon Dose - [●Yes  ○No]                   │
│ 3. Night Dose - [●Yes  ○No]                       │
│                                                    │
```

**User fills all 3 doses with Yes/No at night, recalling what they did during the day.**

---

## Complete Dashboard View (All Scenarios Together)

### User's Full Dashboard with Multiple Goals:
```
┌─────────────────────────────────────────────────────────┐
│ Goal Tracker | Profile Icon | Settings                 │
├─────────────────────────────────────────────────────────┤
│ Monday, December 16, 2025                               │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 🕌 On Time Salah       │ │ 📚 English Practice    │  │
│ │ Today: 3/5 completed   │ │ Week: 1/2 days done    │  │
│ │ ✓ Fajr ✓ Dhuhr ✓ Asr  │ │ Last: Monday           │  │
│ │ ⏰ Maghrib ⏰ Isha      │ │ Need: 1 more day       │  │
│ │ 🔥 12 days streak      │ │ ⏰ 7 days left         │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 📖 Quran Recitation    │ │ 🏋️ Gym Workout         │  │
│ │ Day 2 of 3             │ │ Week: 2/3 completed    │  │
│ │ ✓ Baqarah 1-7 (Day 1)  │ │ ✓ Mon ✓ Wed ⏰ Fri    │  │
│ │ ⏰ Baqarah 8-14 (Day 2)│ │ 🔥 4 weeks streak      │  │
│ │ 🔒 Baqarah 15-20       │ │                        │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ 💊 Medication Reminder │ │ 📝 Daily Journal       │  │
│ │ Today: 2/3 taken       │ │ Today: Not done        │  │
│ │ ✓ Morning ✓ Afternoon  │ │ Deadline: 11:59 PM     │  │
│ │ ⏰ Night (10 PM)       │ │ 🔥 5 days streak       │  │
│ │ 🔥 30 days streak      │ │                        │  │
│ └────────────────────────┘ └────────────────────────┘  │
│                                                          │
│ Bottom Nav: [Home] [Calendar] [Reports] [Settings]     │
└─────────────────────────────────────────────────────────┘
```

---

## Task Completion Logic

### Daily Goals (Example 1):
- All tasks available every day
- User can complete any time during the day
- Streak counts when ALL tasks completed for the day
- Resets next day

### Frequency-Based Goals (Example 2):
- Tasks available any day of the week
- Must complete minimum frequency (e.g., twice per week)
- Tracks completion within week (Mon-Sun)
- Resets weekly

### Sequential Quran Planner (Example 3):
- Tasks unlock sequentially by day
- Day 1 task available first day
- Day 2 task unlocks next day (even if Day 1 missed)
- All tasks must be marked Yes/No
- Goal completes after all days pass

---

## Admin Creation Patterns Summary

### Pattern 1: Daily Multi-Task Goals
**Use Case**: Multiple tasks that need to be completed every day
**Examples**: 5 Times Salah, Daily Medication, Morning Routine
**Admin Setup**:
- Category: Standard Goal
- Frequency: Daily
- Tasks: Manually add 2-5 tasks
- Each task: Yes/No type with optional time

**User Experience**: Badge shows today's task completion count

---

### Pattern 2: Frequency-Based Goals
**Use Case**: Tasks that need completion X times per week
**Examples**: Gym 3x/week, English Practice 2x/week
**Admin Setup**:
- Category: Standard Goal
- Frequency: Twice a Week / Weekly / Custom
- Tasks: Manually add tasks
- Duration: Set number of days/weeks

**User Experience**: Badge shows weekly progress tracker

---

### Pattern 3: Sequential Quran Planner
**Use Case**: Divide Quran reading into daily portions
**Examples**: Complete Surah X in Y days
**Admin Setup**:
- Category: Quran Planner
- Frequency: Daily
- Range: Select From/To Surah and Ayah
- Days: System auto-divides into tasks

**User Experience**: Badge shows current day and unlocked tasks

---

### Pattern 4: Single Task Daily Goals
**Use Case**: One simple daily task
**Examples**: Daily Journal, Morning Walk, Duha Prayer
**Admin Setup**:
- Category: Standard Goal
- Frequency: Daily
- Tasks: Add 1 task only
- Simple Yes/No completion

**User Experience**: Badge shows simple done/not done status

---

### Pattern 5: Time-Specific Task Goals
**Use Case**: Tasks tied to specific times
**Examples**: Medication schedule, Prayer times
**Admin Setup**:
- Category: Standard Goal
- Frequency: Daily
- Tasks: Add tasks with specific times
- Reminders: Set 15 min before each

**User Experience**: Badge shows which time slots completed

---

## Dashboard Badge Display Rules

### 2 Badges Per Row Layout:
- Left badge: First goal
- Right badge: Second goal
- Continues in grid format
- Compact view showing key info only
- Click to expand full details

### Badge Information Priority:
1. Goal name and icon
2. Today's/Week's completion count
3. Task status indicators (✓ ⏰ 🔒)
4. Streak counter
5. Urgency indicators (deadline, days left)

### Badge Status Indicators:
- ✓ = Completed
- ⏰ = Pending (due today)
- 🔒 = Locked (future task)
- ✗ = Missed
- 🔥 = Active streak
- ⚠️ = Warning/behind schedule

---

## Multi-User Assignment Flow

### Admin Flow:
```
1. Admin creates a goal (e.g., "Quran Reading - 10 pages daily")
   ↓
2. During creation, admin selects users to assign:
   - Option 1: Select individual users from list
   - Option 2: Select "All Users"
   ↓
3. Goal is saved and becomes active for selected users
   ↓
4. All assigned users see the goal in their dashboard
   ↓
5. Each user tracks independently (separate progress/streaks)
```

### Editing Assignments:
```
1. Admin clicks "Edit" on existing goal
   ↓
2. Can add/remove users from assignment list
   ↓
3. New users: Goal appears immediately
   ↓
4. Removed users: Goal disappears from their dashboard
   ↓
5. Historical data preserved for removed users
```

### Admin Monitoring View:
```
┌─────────────────────────────────────────────────────────┐
│ Goal: Quran Reading | Assigned Users: 4                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Ahmad    - Progress: 85% | Streak: 7 days | On Track   │
│ Fatima   - Progress: 92% | Streak: 10 days | Excellent │
│ Ibrahim  - Progress: 45% | Streak: 2 days | ⚠️ Behind  │
│ Aisha    - Progress: 78% | Streak: 5 days | Good       │
│                                                          │
│ Average Completion: 75%                                 │
│ Best Performer: Fatima                                  │
│ Needs Support: Ibrahim                                  │
│                                                          │
│ [View Details] [Edit Goal] [Modify Assignments]         │
└─────────────────────────────────────────────────────────┘
```

---

**Status**: Draft - Awaiting Feedback
**Last Updated**: December 16, 2025
