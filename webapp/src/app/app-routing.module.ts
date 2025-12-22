import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

// Auth components
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

// Admin components
import { GoalsListComponent } from './features/admin/goals-list/goals-list.component';
import { GoalFormComponent } from './features/admin/goal-form/goal-form.component';
import { NotificationsListComponent } from './features/admin/notifications-list/notifications-list.component';
import { NotificationFormComponent } from './features/admin/notification-form/notification-form.component';

// User components
import { UserDashboardComponent } from './features/user/dashboard/user-dashboard.component';
import { CalendarComponent } from './features/user/calendar/calendar.component';

// Shared components
// import { SettingsComponent } from './features/shared/settings/settings.component';

const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth routes (no guard)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Admin routes (requires auth + admin role)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'goals', component: GoalsListComponent },
      { path: 'goals/create', component: GoalFormComponent },
      { path: 'goals/edit/:id', component: GoalFormComponent },
      { path: 'notifications', component: NotificationsListComponent },
      { path: 'notifications/create', component: NotificationFormComponent },
      { path: 'notifications/edit/:id', component: NotificationFormComponent },
      // { path: 'settings', component: SettingsComponent }
    ]
  },

  // User routes (requires auth)
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'calendar', component: CalendarComponent },
      // { path: 'settings', component: SettingsComponent }
    ]
  },

  // Fallback route
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
