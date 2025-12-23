import { Component, OnInit } from '@angular/core';
import { GoalAssignmentFirebaseService } from '../../../core/services/firebase/goal-assignment-firebase.service';
import { GoalFirebaseService } from '../../../core/services/firebase/goal-firebase.service';
import { TaskFirebaseService } from '../../../core/services/firebase/task-firebase.service';
import { DailyLogFirebaseService } from '../../../core/services/firebase/daily-log-firebase.service';
import { AuthFirebaseService } from '../../../core/services/firebase/auth-firebase.service';
import { Goal } from '../../../core/models/goal.model';
import { Task } from '../../../core/models/task.model';
import { DailyLog } from '../../../core/models/daily-log.model';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface DayCompletion {
  date: Date;
  completedTasks: number;
  totalTasks: number;
  percentage: number;
  color: string;
}

interface GoalWithCompletion {
  goal: Goal;
  completedTasks: number;
  totalTasks: number;
}

interface GoalTaskItem {
  task: Task;
  completed: boolean;
}

interface GoalAccordion {
  goal: Goal;
  tasks: GoalTaskItem[];
  completedTasks: number;
  totalTasks: number;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentUserId = '';
  currentDate = new Date();
  selectedDate = new Date();
  monthDays: DayCompletion[] = [];
  selectedDayGoals: GoalWithCompletion[] = [];
  selectedDayAccordions: GoalAccordion[] = [];
  loading = false;
  selectedDayLoading = false;

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(
    private authService: AuthFirebaseService,
    private goalAssignmentService: GoalAssignmentFirebaseService,
    private goalService: GoalFirebaseService,
    private taskService: TaskFirebaseService,
    private dailyLogService: DailyLogFirebaseService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId() || '';
    this.loadCalendarMonth();
    this.loadSelectedDayDetails();
  }

  loadCalendarMonth(): void {
    this.loading = true;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get all days in month
    const days: Date[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    // Get all assigned goals for user
    this.goalAssignmentService.getActiveAssignmentsByUserId(this.currentUserId).subscribe({
      next: (assignments) => {
        const goalIds = assignments.map(a => a.goalId);

        if (goalIds.length === 0) {
          this.monthDays = days.map(date => ({
            date,
            completedTasks: 0,
            totalTasks: 0,
            percentage: 0,
            color: 'gray'
          }));
          this.loading = false;
          return;
        }

        // Get all goals and tasks
        this.goalService.getGoalsByIds(goalIds).subscribe({
          next: (goals) => {
            const taskObservables = goals.map(goal => this.taskService.getTasksByGoalId(goal.id));

            forkJoin(taskObservables).subscribe({
              next: (tasksArrays) => {
                const allTasks: Task[] = tasksArrays.flat();
                const taskIds = allTasks.map(t => t.id);

                // Get aggregated daily logs for the month
                this.dailyLogService.getDailyLogsByUserAndDateRange(
                  this.currentUserId,
                  firstDay,
                  lastDay
                ).subscribe({
                  next: (dailyLogs) => {
                    this.monthDays = days.map(date => this.calculateDayCompletion(date, taskIds, dailyLogs));
                    this.loading = false;
                  },
                  error: (error) => {
                    console.error('Error loading logs:', error);
                    this.loading = false;
                  }
                });
              },
              error: (error) => {
                console.error('Error loading tasks:', error);
                this.loading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error loading goals:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        this.loading = false;
      }
    });
  }

  calculateDayCompletion(date: Date, taskIds: string[], logs: DailyLog[]): DayCompletion {
    // Use composite ID format for reliable matching
    const expectedLogId = this.generateDailyLogId(this.currentUserId, date);
    const dayLog = logs.find(log => log.id === expectedLogId);

    const totalTasks = taskIds.length;
    const completedTasks = dayLog ? dayLog.tasks.filter(e => e.value && taskIds.includes(e.taskId)).length : 0;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let color = 'gray';
    if (dayLog) {
      if (percentage >= 80) color = 'green';
      else if (percentage >= 60) color = 'yellow';
      else if (percentage >= 40) color = 'orange';
      else color = 'red';
    }

    return { date, completedTasks, totalTasks, percentage, color };
  }

  loadSelectedDayDetails(): void {
    this.selectedDayLoading = true;
    this.clearSelectedDayData();

    this.getActiveGoalsForSelectedDate()
      .pipe(
        switchMap(activeGoals => this.getGoalsWithTasks(activeGoals)),
        switchMap(goalsWithTasks => this.buildSelectedDayData(goalsWithTasks))
      )
      .subscribe({
        next: (data) => {
          this.selectedDayGoals = data.goals;
          this.selectedDayAccordions = data.accordions;
          this.selectedDayLoading = false;
        },
        error: (error) => {
          console.error('Error loading selected day details:', error);
          this.selectedDayLoading = false;
        }
      });
  }

  private clearSelectedDayData(): void {
    this.selectedDayGoals = [];
    this.selectedDayAccordions = [];
  }

  private getActiveGoalsForSelectedDate(): Observable<Goal[]> {
    return this.goalAssignmentService.getActiveAssignmentsByUserId(this.currentUserId)
      .pipe(
        switchMap(assignments => {
          const goalIds = assignments.map(a => a.goalId);
          if (goalIds.length === 0) {
            return of([]);
          }
          return this.goalService.getGoalsByIds(goalIds);
        }),
        map(goals => goals.filter(g => this.isGoalActiveOnDate(g, this.selectedDate)))
      );
  }

  private getGoalsWithTasks(activeGoals: Goal[]): Observable<Array<{goal: Goal, tasks: Task[]}>> {
    if (activeGoals.length === 0) {
      return of([]);
    }

    const taskObservables = activeGoals.map(goal =>
      this.taskService.getTasksByGoalId(goal.id).pipe(
        map(tasks => ({ goal, tasks }))
      )
    );

    return forkJoin(taskObservables);
  }

  private buildSelectedDayData(goalsWithTasks: Array<{goal: Goal, tasks: Task[]}>): Observable<{goals: GoalWithCompletion[], accordions: GoalAccordion[]}> {
    if (goalsWithTasks.length === 0) {
      return of({ goals: [], accordions: [] });
    }

    return this.dailyLogService.getDailyLogByUserAndDate(this.currentUserId, this.selectedDate)
      .pipe(
        map(dailyLog => {
          const entries = dailyLog?.tasks || [];
          
          const goals = this.buildGoalCompletionSummary(goalsWithTasks, entries);
          const accordions = this.buildGoalAccordions(goalsWithTasks, entries);
          
          return { goals, accordions };
        })
      );
  }

  private buildGoalCompletionSummary(goalsWithTasks: Array<{goal: Goal, tasks: Task[]}>, entries: any[]): GoalWithCompletion[] {
    return goalsWithTasks.map(gwt => ({
      goal: gwt.goal,
      completedTasks: entries.filter(e => !!e.value && gwt.tasks.some(t => t.id === e.taskId)).length,
      totalTasks: gwt.tasks.length
    }));
  }

  private buildGoalAccordions(goalsWithTasks: Array<{goal: Goal, tasks: Task[]}>, entries: any[]): GoalAccordion[] {
    return goalsWithTasks.map(gwt => {
      const tasks: GoalTaskItem[] = gwt.tasks.map(t => ({
        task: t,
        completed: !!entries.find(e => e.taskId === t.id && e.value)
      }));
      
      return {
        goal: gwt.goal,
        tasks,
        completedTasks: tasks.filter(x => x.completed).length,
        totalTasks: tasks.length
      };
    });
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.loadCalendarMonth();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.loadCalendarMonth();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.loadCalendarMonth();
    this.loadSelectedDayDetails();
  }

  selectDay(dayCompletion: DayCompletion): void {
    this.selectedDate = new Date(dayCompletion.date);
    this.loadSelectedDayDetails();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  isSelectedDate(date: Date): boolean {
    return date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear();
  }

  getMonthYearDisplay(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  getSelectedDateDisplay(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return this.selectedDate.toLocaleDateString('en-US', options);
  }

  getTodayDisplay(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return today.toLocaleDateString('en-US', options);
  }

  getEmptyDaysStart(): number[] {
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    return Array(firstDay.getDay()).fill(0);
  }

  getColorClass(color: string): string {
    return `day-${color}`;
  }

  formatDateYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private generateDailyLogId(userId: string, date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${userId}-${year}${month}${day}`;
  }

  getTotalCompletionForSelectedDay(): { completed: number; total: number; percentage: number } {
    const completed = this.selectedDayGoals.reduce((sum, g) => sum + g.completedTasks, 0);
    const total = this.selectedDayGoals.reduce((sum, g) => sum + g.totalTasks, 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }

  getTasksForGoal(goalId: string): GoalTaskItem[] {
    const accordion = this.selectedDayAccordions.find(acc => acc.goal.id === goalId);
    return accordion ? accordion.tasks : [];
  }

  getMonthCompletionPercentage(): number {
    const total = this.monthDays.reduce((sum, day) => sum + day.totalTasks, 0);
    const completed = this.monthDays.reduce((sum, day) => sum + day.completedTasks, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getMonthTotalTasks(): number {
    return this.monthDays.reduce((sum, day) => sum + day.totalTasks, 0);
  }

  getMonthCompletedTasks(): number {
    return this.monthDays.reduce((sum, day) => sum + day.completedTasks, 0);
  }

  private isGoalActiveOnDate(goal: Goal, date: Date): boolean {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startDate = new Date(goal.startDate.getFullYear(), goal.startDate.getMonth(), goal.startDate.getDate());
    const endDate = goal.endDate 
      ? new Date(goal.endDate.getFullYear(), goal.endDate.getMonth(), goal.endDate.getDate()) 
      : null;
    
    const afterStart = targetDate.getTime() >= startDate.getTime();
    const beforeEnd = endDate ? targetDate.getTime() <= endDate.getTime() : true;
    
    return goal.active && afterStart && beforeEnd;
  }
}
