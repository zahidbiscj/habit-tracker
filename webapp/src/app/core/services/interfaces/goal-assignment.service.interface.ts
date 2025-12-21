import { Observable } from 'rxjs';
import { GoalAssignment } from '../../models/goal-assignment.model';

/**
 * Provider-agnostic Goal Assignment Service Interface
 */
export interface IGoalAssignmentService {
  /**
   * Get assignment by composite key
   */
  getAssignment(goalId: string, userId: string): Observable<GoalAssignment | null>;

  /**
   * Get all assignments for a goal
   */
  getAssignmentsByGoalId(goalId: string): Observable<GoalAssignment[]>;

  /**
   * Get all assignments for a user
   */
  getAssignmentsByUserId(userId: string): Observable<GoalAssignment[]>;

  /**
   * Get active assignments for a user
   */
  getActiveAssignmentsByUserId(userId: string): Observable<GoalAssignment[]>;

  /**
   * Create a new assignment
   */
  createAssignment(assignment: GoalAssignment): Observable<GoalAssignment>;

  /**
   * Create multiple assignments (batch)
   */
  createAssignments(assignments: GoalAssignment[]): Observable<GoalAssignment[]>;

  /**
   * Update an existing assignment
   */
  updateAssignment(assignment: GoalAssignment): Observable<void>;

  /**
   * Delete an assignment (soft delete - set active=false)
   */
  deleteAssignment(goalId: string, userId: string): Observable<void>;

  /**
   * Delete all assignments for a goal
   */
  deleteAssignmentsByGoalId(goalId: string): Observable<void>;

  /**
   * Assign goal to multiple users
   */
  assignGoalToUsers(goalId: string, userIds: string[], createdBy: string): Observable<void>;

  /**
   * Unassign goal from multiple users
   */
  unassignGoalFromUsers(goalId: string, userIds: string[]): Observable<void>;
}
