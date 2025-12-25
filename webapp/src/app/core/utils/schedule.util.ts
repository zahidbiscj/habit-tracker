import { Goal } from '../models/goal.model';
import { Task } from '../models/task.model';

const DAY_NAMES: string[] = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

export function getDayName(date: Date): string {
  return DAY_NAMES[new Date(date).getDay()];
}

export function normalizeDayName(name: string): string {
  return (name || '').toString().trim().toLowerCase();
}

export function isDateInRange(date: Date, start: Date, end?: Date | null): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null;
  const afterStart = d.getTime() >= s.getTime();
  const beforeEnd = e ? d.getTime() <= e.getTime() : true;
  return afterStart && beforeEnd;
}

export function isGoalActiveOnDate(goal: Goal, date: Date): boolean {
  return !!goal.active && isDateInRange(date, goal.startDate, goal.endDate ?? null);
}

/**
 * Check if a task is scheduled for a specific date based on day-of-week.
 * If task.days is empty or not set, task is scheduled every day.
 * If task.days contains specific days (e.g., ['friday']), only those days are scheduled.
 */
export function isTaskScheduledOnDate(task: Task, date: Date): boolean {
  const dayName = getDayName(date);
  const hasDays = Array.isArray(task.days) && task.days.length > 0;
  if (!hasDays) return true; // no filter => every day
  const normalized = (task.days || []).map(normalizeDayName);
  return normalized.includes(dayName);
}

/**
 * COMPREHENSIVE FILTER: Check if a task should appear on a given date.
 * Combines BOTH goal date range check AND task day-of-week check.
 * 
 * @param task - The task to check
 * @param goal - The goal this task belongs to
 * @param date - The date to check
 * @returns true if task should appear on this date, false otherwise
 * 
 * Rules:
 * 1. Goal must be active on this date (within startDate and endDate)
 * 2. Task must be scheduled for this day of week (if days[] is specified)
 * 3. If either condition fails, task is NOT shown
 */
export function isTaskVisibleOnDate(task: Task, goal: Goal, date: Date): boolean {
  // First check: Is the goal active on this date?
  if (!isGoalActiveOnDate(goal, date)) {
    return false;
  }
  
  // Second check: Is the task scheduled for this day of the week?
  if (!isTaskScheduledOnDate(task, date)) {
    return false;
  }
  
  // Third check: Is the task active?
  if (!task.active) {
    return false;
  }
  
  return true;
}

/**
 * Filter tasks for a specific date (legacy function, consider using isTaskVisibleOnDate)
 */
export function filterTasksForDate(tasks: Task[], date: Date): Task[] {
  return (tasks || []).filter(t => !!t.active && isTaskScheduledOnDate(t, date));
}

/**
 * Filter tasks for a specific date WITH goal context (recommended)
 * Use this when you have both task and goal information.
 */
export function filterTasksForDateWithGoal(tasks: Task[], goal: Goal, date: Date): Task[] {
  return (tasks || []).filter(t => isTaskVisibleOnDate(t, goal, date));
}
