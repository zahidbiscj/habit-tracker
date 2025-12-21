import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

/**
 * Provider-agnostic User Service Interface
 * Implement this interface for Firebase, Supabase, REST API, etc.
 */
export interface IUserService {
  /**
   * Get user by ID
   */
  getUserById(userId: string): Observable<User | null>;

  /**
   * Get all users
   */
  getAllUsers(): Observable<User[]>;

  /**
   * Get users by role
   */
  getUsersByRole(role: 'admin' | 'user'): Observable<User[]>;

  /**
   * Create a new user
   */
  createUser(user: User): Observable<User>;

  /**
   * Update an existing user
   */
  updateUser(user: User): Observable<void>;

  /**
   * Delete a user (soft delete - set active=false)
   */
  deleteUser(userId: string): Observable<void>;

  /**
   * Update FCM token for push notifications
   */
  updateFcmToken(userId: string, token: string): Observable<void>;
}
