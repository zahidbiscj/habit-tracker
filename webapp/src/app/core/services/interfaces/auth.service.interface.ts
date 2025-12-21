import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

/**
 * Provider-agnostic Authentication Service Interface
 */
export interface IAuthService {
  /**
   * Get current authenticated user
   */
  getCurrentUser(): Observable<User | null>;

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Observable<boolean>;

  /**
   * Check if current user is admin
   */
  isAdmin(): Observable<boolean>;

  /**
   * Register a new user
   */
  register(email: string, password: string, name: string): Observable<User>;

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<User>;

  /**
   * Logout current user
   */
  logout(): Observable<void>;

  /**
   * Update user email
   */
  updateEmail(newEmail: string): Observable<void>;

  /**
   * Update user password
   */
  updatePassword(currentPassword: string, newPassword: string): Observable<void>;

  /**
   * Send password reset email
   */
  resetPassword(email: string): Observable<void>;
}
