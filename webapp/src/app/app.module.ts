import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { ServiceWorkerModule } from '@angular/service-worker';

// Environment
import { environment } from '../environments/environment';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Root component
import { AppComponent } from './app.component';

// Shared module
import { SharedModule } from './shared/shared.module';

// Service interfaces and implementations
import { IAuthService } from './core/services/interfaces/auth.service.interface';
import { IUserService } from './core/services/interfaces/user.service.interface';
import { IGoalService } from './core/services/interfaces/goal.service.interface';
import { ITaskService } from './core/services/interfaces/task.service.interface';
import { IDailyLogService } from './core/services/interfaces/daily-log.service.interface';
import { IGoalAssignmentService } from './core/services/interfaces/goal-assignment.service.interface';
import { INotificationService } from './core/services/interfaces/notification.service.interface';

import { AuthFirebaseService } from './core/services/firebase/auth-firebase.service';
import { UserFirebaseService } from './core/services/firebase/user-firebase.service';
import { GoalFirebaseService } from './core/services/firebase/goal-firebase.service';
import { TaskFirebaseService } from './core/services/firebase/task-firebase.service';
import { DailyLogFirebaseService } from './core/services/firebase/daily-log-firebase.service';
import { GoalAssignmentFirebaseService } from './core/services/firebase/goal-assignment-firebase.service';
import { NotificationFirebaseService } from './core/services/firebase/notification-firebase.service';

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
import { DailyEntryModalComponent } from './features/user/daily-entry-modal/daily-entry-modal.component';
import { CalendarComponent } from './features/user/calendar/calendar.component';

// Shared components
// import { SettingsComponent } from './features/shared/settings/settings.component';
import { TestNotificationComponent } from './features/admin/notifications-list/test-notification.component';

@NgModule({
  declarations: [
    AppComponent,
    // Auth
    LoginComponent,
    RegisterComponent,
    // Admin
    GoalsListComponent,
    GoalFormComponent,
    NotificationsListComponent,
    NotificationFormComponent,
    TestNotificationComponent,
    // User
    UserDashboardComponent,
    DailyEntryModalComponent,
    CalendarComponent,
    // Shared
    // SettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    // PWA Service Worker
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    // Firebase initialization
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    // Provider-agnostic service bindings
    // To switch to another provider (e.g., Supabase), just change the useClass
    AuthFirebaseService,
    UserFirebaseService,
    GoalFirebaseService,
    TaskFirebaseService,
    DailyLogFirebaseService,
    GoalAssignmentFirebaseService,
    NotificationFirebaseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }