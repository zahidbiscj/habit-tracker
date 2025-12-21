import { Observable } from 'rxjs';
import { Goal } from '../../models/goal.model';

/**
 * Provider-agnostic Goal Service Interface
 */
export interface IGoalService {
  /**
   * Get goal by ID
   */
  getGoalById(goalId: string): Observable<Goal | null>;

  /**
   * Get all goals
   */
  getAllGoals(): Observable<Goal[]>;

  /**
   * Get active goals only
   */
  getActiveGoals(): Observable<Goal[]>;

  /**
   * Get goals for a specific user
   */
  getGoalsForUser(userId: string): Observable<Goal[]>;

  /**
   * Get goals within a date range
   */
  getGoalsByDateRange(startDate: Date, endDate: Date): Observable<Goal[]>;

  /**
   * Create a new goal
   */
  createGoal(goal: Goal): Observable<Goal>;

  /**
   * Update an existing goal
   */
  updateGoal(goal: Goal): Observable<void>;

  /**
   * Delete a goal (soft delete - set active=false)
   */
  deleteGoal(goalId: string): Observable<void>;
}
