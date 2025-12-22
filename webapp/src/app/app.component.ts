import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthFirebaseService } from './core/services/firebase/auth-firebase.service';
import { User } from './core/models/user.model';
import { NotificationSchedulerService } from './core/services/notification-scheduler.service';
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

  constructor(
    private authService: AuthFirebaseService,
    private router: Router,
    private notificationScheduler: NotificationSchedulerService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'admin';
      
      // Start notification scheduler when user logs in
      if (user) {
        console.log('Starting notification scheduler for user:', user.name);
        this.notificationScheduler.startScheduler();
      } else {
        this.notificationScheduler.stopScheduler();
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
          alert('Failed to logout');
        }
      });
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
