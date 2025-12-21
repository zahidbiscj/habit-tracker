import { Observable } from 'rxjs';
import { Task } from '../../models/task.model';

/**
 * Provider-agnostic Task Service Interface
 */
export interface ITaskService {
  /**
   * Get task by ID
   */
  getTaskById(taskId: string): Observable<Task | null>;

  /**
   * Get all tasks for a goal
   */
  getTasksByGoalId(goalId: string): Observable<Task[]>;

  /**
   * Get active tasks for a goal
   */
  getActiveTasksByGoalId(goalId: string): Observable<Task[]>;

  /**
   * Create a new task
   */
  createTask(task: Task): Observable<Task>;

  /**
   * Create multiple tasks (batch)
   */
  createTasks(tasks: Task[]): Observable<Task[]>;

  /**
   * Update an existing task
   */
  updateTask(task: Task): Observable<void>;

  /**
   * Delete a task (soft delete - set active=false)
   */
  deleteTask(taskId: string): Observable<void>;

  /**
   * Delete all tasks for a goal
   */
  deleteTasksByGoalId(goalId: string): Observable<void>;

  /**
   * Reorder tasks within a goal
   */
  reorderTasks(goalId: string, taskIds: string[]): Observable<void>;
}
