# Webapp Setup

```powershell
cd "c:\RocheProjects\HabitTracker";
ng new webapp --routing --style=scss;
cd webapp;
ng add @angular/pwa;
ng add @angular/fire;
```

Then create the following Angular services (interfaces-first, DI-based):
- `auth.service.ts` / `auth.service.interface.ts`
- `goal.service.ts` / `goal.service.interface.ts`
- `task.service.ts` / `task.service.interface.ts`
- `daily-log.service.ts` / `daily-log.service.interface.ts`
- `notification.service.ts` / `notification.service.interface.ts`

Pages to implement:
- Admin: Goals, Tasks, Notifications
- User: Dashboard, Daily Entry, Calendar
