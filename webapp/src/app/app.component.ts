import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthFirebaseService } from './core/services/firebase/auth-firebase.service';
import { User } from './core/models/user.model';
import { MessagingFirebaseService } from './core/services/firebase/messaging-firebase.service';
import { ToastService } from './core/services/toast.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Habit Tracker';
  currentUser: User | null = null;
  showNavigation: boolean = false;
  isAdmin: boolean = false;
  sidebarCollapsed: boolean = false;
  showSidebar: boolean = false;

  constructor(
    private authService: AuthFirebaseService,
    public router: Router,
    private messagingService: MessagingFirebaseService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'admin';
      
      // Push notifications via FCM only
      if (user) {
        this.messagingService.initAndRegisterToken().subscribe(token => {
          if (token) {
            console.log('FCM token registered for user:', token);
            this.messagingService.attachForegroundHandler();
          } else {
            console.warn('No FCM token available - push notifications disabled');
          }
        });
      }
    });

    // Show/hide navigation based on route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const hideNavRoutes = ['/login', '/register'];
      this.showNavigation = !hideNavRoutes.includes(event.url);
    });
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          this.toast.error('Failed to logout');
        }
      });
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return '?';
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.currentUser.name.substring(0, 2).toUpperCase();
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }
}
