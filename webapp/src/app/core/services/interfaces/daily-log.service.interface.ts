import { Observable } from 'rxjs';
import { DailyLog } from '../../models/daily-log.model';

/**
 * Provider-agnostic Daily Log Service Interface
 */
export interface IDailyLogService {
  /**
   * Get log by ID
   */
  getLogById(logId: string): Observable<DailyLog | null>;

  /**
   * Get logs for a user on a specific date
   */
  getLogsByUserAndDate(userId: string, date: Date): Observable<DailyLog[]>;

  /**
   * Get logs for a user within a date range
   */
  getLogsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Observable<DailyLog[]>;

  /**
   * Get log for a specific user, task, and date
   */
  getLogByUserTaskDate(userId: string, taskId: string, date: Date): Observable<DailyLog | null>;

  /**
   * Create a new log
   */
  createLog(log: DailyLog): Observable<DailyLog>;

  /**
   * Create multiple logs (batch)
   */
  createLogs(logs: DailyLog[]): Observable<DailyLog[]>;

  /**
   * Update an existing log
   */
  updateLog(log: DailyLog): Observable<void>;

  /**
   * Update or create log (upsert)
   */
  upsertLog(log: DailyLog): Observable<DailyLog>;

  /**
   * Delete a log (soft delete - set active=false)
   */
  deleteLog(logId: string): Observable<void>;

  /**
   * Get completion statistics for a user
   */
  getCompletionStats(userId: string, startDate: Date, endDate: Date): Observable<{
    totalTasks: number;
    completedTasks: number;
    percentage: number;
  }>;
}
