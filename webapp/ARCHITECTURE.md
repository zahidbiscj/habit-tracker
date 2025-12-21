# Habit Tracker - Reusable Component Architecture

## 🎯 Overview
This project follows a **component-driven, provider-agnostic architecture** where all UI components are reusable and backend services are abstracted through interfaces.

## 📁 Project Structure

```
src/app/
├── shared/
│   ├── components/
│   │   └── common/              # Reusable UI components
│   │       ├── ht-input/        # Input field component
│   │       ├── ht-textarea/     # Textarea component
│   │       ├── ht-dropdown/     # Dropdown component
│   │       ├── ht-datepicker/   # Date picker component
│   │       ├── ht-button/       # Button component
│   │       ├── ht-table/        # Table with search/filter/pagination
│   │       ├── ht-card/         # Card component
│   │       ├── ht-modal/        # Modal/Dialog component
│   │       └── ht-checkbox/     # Checkbox component
│   └── shared.module.ts         # Exports all reusable components
│
├── core/
│   ├── models/                  # Data models (User, Goal, Task, etc.)
│   ├── services/
│   │   ├── interfaces/          # Provider-agnostic service interfaces
│   │   └── firebase/            # Firebase implementations (to be created)
│   └── guards/                  # Auth & role guards (to be created)
│
└── features/                    # Feature modules (auth, admin, user)
```

## 🔧 Reusable Components

All components use **PrimeNG** wrapped with custom functionality and **custom CSS** (mobile-first).

### Form Components

#### `<ht-input>` - Input Field
```html
<ht-input 
  [(ngModel)]="name"
  label="Full Name"
  [required]="true"
  placeholder="Enter your name"
  [errorMessage]="errors.name"
></ht-input>
```

#### `<ht-textarea>` - Textarea
```html
<ht-textarea 
  [(ngModel)]="description"
  label="Description"
  [rows]="4"
></ht-textarea>
```

#### `<ht-dropdown>` - Dropdown with search
```html
<ht-dropdown 
  [(ngModel)]="selectedUser"
  [options]="userOptions"
  label="Select User"
  [filter]="true"
></ht-dropdown>
```

#### `<ht-datepicker>` - Date Picker
```html
<ht-datepicker 
  [(ngModel)]="startDate"
  label="Start Date"
  dateFormat="yy-mm-dd"
></ht-datepicker>
```

#### `<ht-checkbox>` - Checkbox
```html
<ht-checkbox 
  [(ngModel)]="active"
  label="Active"
></ht-checkbox>
```

#### `<ht-button>` - Button
```html
<ht-button 
  label="Save"
  severity="primary"
  icon="pi pi-save"
  (onClick)="handleSave()"
  [loading]="saving"
></ht-button>
```

#### `<ht-table>` - Table with Search & Pagination
```html
<ht-table 
  [data]="goals"
  [columns]="columns"
  [actions]="actions"
  [searchable]="true"
></ht-table>
```

```typescript
// Define columns
columns: TableColumn[] = [
  { field: 'name', header: 'Goal Name', sortable: true },
  { field: 'startDate', header: 'Start Date' }
];

// Define actions (Edit, Delete buttons)
actions: TableAction[] = [
  { 
    icon: 'pi pi-pencil',
    severity: 'primary',
    handler: (row) => this.editGoal(row)
  },
  { 
    icon: 'pi pi-trash',
    severity: 'danger',
    handler: (row) => this.deleteGoal(row)
  }
];
```

#### `<ht-card>` - Card
```html
<ht-card title="Goal Details" icon="pi pi-target">
  <p>Card content goes here</p>
</ht-card>
```

#### `<ht-modal>` - Modal/Dialog
```html
<ht-modal 
  [(visible)]="showModal"
  header="Edit Goal">
  <p>Modal content</p>
</ht-modal>
```

## 🏗️ Provider-Agnostic Architecture

### Service Interfaces
All data access uses **interfaces**, not direct Firebase calls:

```typescript
// ❌ DON'T DO THIS (tight coupling)
constructor(private firestore: Firestore) {}

// ✅ DO THIS (provider-agnostic)
constructor(private goalService: IGoalService) {}
```

### Available Interfaces:
- `IAuthService` - Authentication
- `IUserService` - User management
- `IGoalService` - Goal CRUD
- `ITaskService` - Task CRUD
- `IDailyLogService` - Daily logs
- `IGoalAssignmentService` - Assignments
- `INotificationService` - Notifications

### Switching Providers
To switch from Firebase to Supabase:

1. Implement interfaces for Supabase
2. Change providers in `app.module.ts`:

```typescript
providers: [
  { provide: IGoalService, useClass: GoalSupabaseService }
]
```

## ✨ Benefits

### 1. Single Source of Truth
- Change button color once → updates everywhere
- Fix search bug once → works in all tables
- Add validation once → applies to all forms

### 2. Consistency
All UI elements look and behave the same.

### 3. Easy Maintenance
- Fix bugs once
- Add features in one place
- Test components in isolation

### 4. Provider Independence
- Switch backends without touching UI
- Test with mock services
- Future-proof architecture

## 📝 Status

✅ Created reusable components (9 components)
✅ Created data models (6 models)
✅ Created service interfaces (7 interfaces)
🔄 Next: Firebase service implementations
🔄 Next: Auth guards
🔄 Next: Feature pages

## 🎨 Styling

- **Mobile-first** responsive design
- Custom CSS (no Bootstrap/Tailwind)
- PrimeNG for functionality only
- Breakpoints: 768px (tablet), 1024px (desktop)
