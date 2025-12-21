# Quran Planner - Dynamic Progress Tracking System

## Updated Entry Form Design

```
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
```

## How It Works

### 1. Input Methods

**Option A: Enter Ayah Count (Recommended)**
- User types number in "Enter ayahs completed today" field
- System auto-calculates task completion in real-time
- Progress bars update dynamically

**Option B: Manual Checkbox Selection**
- User checks/unchecks individual task checkboxes
- Each check = mark full task as complete (10 ayahs)
- System syncs ayah count with checkbox selection

### 2. Auto-Calculation Logic

When user types "25" in the ayah field:

```
Step 1: Calculate distribution
- Day 1 needs: 10 ayahs (1-10)
- Day 2 needs: 10 ayahs (11-20)
- Day 3 needs: 10 ayahs (21-30)

Step 2: Allocate 25 ayahs
- Day 1: Gets 10/10 → 100% → [██████████] ✓
- Day 2: Gets 10/10 → 100% → [██████████] ✓
- Day 3: Gets 5/10  → 50%  → [█████░░░░░]
- Day 4: Gets 0/10  → 0%   → [░░░░░░░░░░]

Step 3: Visual feedback
- Show checkmark for completed tasks
- Show percentage for partial tasks
- Show empty bar for pending tasks
```

### 3. Visual Indicators

| Progress Bar | Status | Meaning |
|--------------|--------|---------|
| [██████████] 10/10 ✓ | Completed | Task fully done (green) |
| [█████░░░░░] 5/10 (50%) | Partial | Half completed (yellow) |
| [███░░░░░░░] 3/10 (30%) | Partial | 30% done (yellow) |
| [░░░░░░░░░░] 0/10 | Pending | Not started (gray) |

### 4. Task Display Rules

**Today's Entry (December 17):**
- Shows all incomplete or partial tasks
- User enters 25 ayahs
- Day 1 & Day 2 become 100% complete
- Day 3 becomes 50% complete

**Tomorrow's Entry (December 18):**
- Day 1 & Day 2 **disappear** (100% complete)
- Day 3 still shows: [█████░░░░░] 5/10 (needs 5 more)
- Day 4, 5, 6... show as pending

**Day After (December 19):**
- If user completes Day 3 → it disappears
- Only Day 4+ remain visible

### 5. Examples

#### Example 1: Reading Exactly As Planned

**Day 1 (Dec 17):**
```
User input: 10 ayahs
Result:
[ ] Day 1: 1-10   [██████████] 10/10 ✓
[ ] Day 2: 11-20  [░░░░░░░░░░] 0/10
[ ] Day 3: 21-30  [░░░░░░░░░░] 0/10
```

**Day 2 (Dec 18):**
```
Day 1 is hidden (completed)
User sees:
[ ] Day 2: 11-20  [░░░░░░░░░░] 0/10
[ ] Day 3: 21-30  [░░░░░░░░░░] 0/10
[ ] Day 4: 31-40  [░░░░░░░░░░] 0/10
```

#### Example 2: Reading Ahead

**Day 1 (Dec 17):**
```
User input: 50 ayahs (5 days worth!)
Result:
[ ] Day 1: 1-10   [██████████] 10/10 ✓
[ ] Day 2: 11-20  [██████████] 10/10 ✓
[ ] Day 3: 21-30  [██████████] 10/10 ✓
[ ] Day 4: 31-40  [██████████] 10/10 ✓
[ ] Day 5: 41-50  [██████████] 10/10 ✓
[ ] Day 6: 51-60  [░░░░░░░░░░] 0/10
```

**Day 2 (Dec 18):**
```
Days 1-5 are hidden (all completed)
User sees:
[ ] Day 6: 51-60   [░░░░░░░░░░] 0/10
[ ] Day 7: 61-70   [░░░░░░░░░░] 0/10
[ ] Day 8: 71-80   [░░░░░░░░░░] 0/10
```

#### Example 3: Reading Partial

**Day 1 (Dec 17):**
```
User input: 15 ayahs
Result:
[ ] Day 1: 1-10   [██████████] 10/10 ✓
[ ] Day 2: 11-20  [█████░░░░░] 5/10  (50%)
[ ] Day 3: 21-30  [░░░░░░░░░░] 0/10
```

**Day 2 (Dec 18):**
```
Day 1 hidden, Day 2 still visible (partial)
User input: 10 ayahs
Result:
[ ] Day 2: 11-20  [██████████] 10/10 ✓  (5 from yesterday + 10 today)
[ ] Day 3: 21-30  [░░░░░░░░░░] 0/10
```

### 6. Checkbox Manual Override

User can ignore the ayah input field and just check tasks:

```
User checks Day 1, Day 2, Day 5
Result:
[✓] Day 1: 1-10   [██████████] 10/10 ✓
[✓] Day 2: 11-20  [██████████] 10/10 ✓
[ ] Day 3: 21-30  [░░░░░░░░░░] 0/10
[ ] Day 4: 31-40  [░░░░░░░░░░] 0/10
[✓] Day 5: 41-50  [██████████] 10/10 ✓

Total: 30 ayahs (calculated from checkboxes)
```

### 7. Next Day Behavior Summary

| Task Status | Next Day Visibility |
|-------------|-------------------|
| 100% Complete (10/10) | ❌ Hidden (disappears) |
| Partial (e.g., 5/10) | ✅ Visible (shows progress) |
| 0% (not started) | ✅ Visible (shows empty bar) |

**Key Rule:** Once a task reaches 100%, it never appears again in future entries.

### 8. Dashboard Badge Update

```
┌────────────────────────┐
│ 📖 Quran Recitation    │
│ Progress: [███░] 25/286│
│ 5 tasks completed      │
│ 3 days ahead! 🎉       │
└────────────────────────┘
```

## Technical Implementation Notes

### Data Storage
```json
{
  "goalId": "quran-baqarah",
  "totalAyahs": 286,
  "tasks": [
    {
      "day": 1,
      "range": "1-10",
      "targetAyahs": 10,
      "completedAyahs": 10,
      "status": "completed",
      "completedDate": "2025-12-17"
    },
    {
      "day": 2,
      "range": "11-20",
      "targetAyahs": 10,
      "completedAyahs": 10,
      "status": "completed",
      "completedDate": "2025-12-17"
    },
    {
      "day": 3,
      "range": "21-30",
      "targetAyahs": 10,
      "completedAyahs": 5,
      "status": "partial",
      "lastUpdated": "2025-12-17"
    }
  ]
}
```

### Calculation Logic
```javascript
function calculateTaskProgress(ayahsEntered, tasks) {
  let remainingAyahs = ayahsEntered;
  
  for (let task of tasks) {
    if (task.status === 'completed') continue; // Skip already completed
    
    let needed = task.targetAyahs - task.completedAyahs;
    
    if (remainingAyahs >= needed) {
      // Complete this task
      task.completedAyahs = task.targetAyahs;
      task.status = 'completed';
      remainingAyahs -= needed;
    } else if (remainingAyahs > 0) {
      // Partial completion
      task.completedAyahs += remainingAyahs;
      task.status = 'partial';
      remainingAyahs = 0;
      break;
    }
  }
  
  return tasks;
}
```

### Display Filter
```javascript
function getVisibleTasks(tasks) {
  return tasks.filter(task => task.status !== 'completed');
}
```

## Summary

✅ **User types ayah count** → System auto-calculates task progress  
✅ **Each task has progress bar** → Visual feedback (0%, 50%, 100%)  
✅ **Completed tasks disappear** → Only show pending/partial tasks  
✅ **Manual checkbox option** → Alternative input method  
✅ **Real-time calculation** → Updates as user types  
✅ **Persistent progress** → Partial tasks carry over to next day  

This system gives users **flexibility** (can read ahead/behind) while maintaining **clear progress tracking** with visual feedback!
