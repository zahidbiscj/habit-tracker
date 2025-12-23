import { Observable } from 'rxjs';
import { DailyLog, DailyTaskEntry } from '../../models/daily-log.model';

/**
 * Provider-agnostic Daily Log Service Interface
 */
export interface IDailyLogService {
  /** Get aggregated daily log by composite ID */
  getLogById(logId: string): Observable<DailyLog | null>;

  /** Get aggregated daily log for a user and date */
  getDailyLogByUserAndDate(userId: string, date: Date): Observable<DailyLog | null>;

  /** Get aggregated daily logs for a user within a date range */
  getDailyLogsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Observable<DailyLog[]>;

  /** Get aggregated daily logs for a user and month (YYYY-MM) */
  getDailyLogsByUserAndMonth(userId: string, month: string): Observable<DailyLog[]>;

  /** Upsert single task entry into a user's daily log (creates log if missing) */
  upsertTaskEntry(userId: string, date: Date, entry: DailyTaskEntry): Observable<DailyLog>;

  /** Upsert multiple task entries (batch) */
  upsertTaskEntries(userId: string, date: Date, entries: DailyTaskEntry[]): Observable<DailyLog>;

  /** Replace entire daily log (merge tasks and recompute aggregates) */
  upsertDailyLog(log: DailyLog): Observable<DailyLog>;

  /** Soft delete a daily log */
  deleteLog(logId: string): Observable<void>;

  /** Completion statistics for a user within date range */
  getCompletionStats(userId: string, startDate: Date, endDate: Date): Observable<{
    totalDays: number;
    avgCompletionRate: number;
    fullyCompletedDays: number;
    partiallyCompletedDays: number;
    pendingDays: number;
  }>;
}
