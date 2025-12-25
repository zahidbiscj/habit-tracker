import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFirebaseService } from '../../../core/services/firebase/auth-firebase.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthFirebaseService,
    private router: Router,
    private toast: ToastService
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        // Redirect based on role
        if (user.role === 'admin') {
          this.router.navigate(['/admin/goals']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }

  onForgotPassword(): void {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Password reset email sent. Please check your inbox.');
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to send reset email';
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
