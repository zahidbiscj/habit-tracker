import { Component, OnInit } from '@angular/core';
import { GoalAssignmentFirebaseService } from '../../../core/services/firebase/goal-assignment-firebase.service';
import { GoalFirebaseService } from '../../../core/services/firebase/goal-firebase.service';
import { TaskFirebaseService } from '../../../core/services/firebase/task-firebase.service';
import { DailyLogFirebaseService } from '../../../core/services/firebase/daily-log-firebase.service';
import { AuthFirebaseService } from '../../../core/services/firebase/auth-firebase.service';
import { Goal } from '../../../core/models/goal.model';
import { Task } from '../../../core/models/task.model';
import { DailyLog } from '../../../core/models/daily-log.model';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

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
  ) {}

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

                // Get all daily logs for the month
                this.dailyLogService.getLogsForUserInDateRange(
                  this.currentUserId,
                  firstDay,
                  lastDay
                ).subscribe({
                  next: (logs) => {
                    this.monthDays = days.map(date => this.calculateDayCompletion(date, taskIds, logs));
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
    const dateStr = this.formatDateYYYYMMDD(date);
    const dayLogs = logs.filter(log => this.formatDateYYYYMMDD(log.date) === dateStr);
    
    const completedTasks = dayLogs.filter(log => log.value === true).length;
    const totalTasks = taskIds.length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    let color = 'gray';
    if (dayLogs.length > 0) {
      if (percentage >= 80) color = 'green';
      else if (percentage >= 60) color = 'yellow';
      else if (percentage >= 40) color = 'orange';
      else color = 'red';
    }

    return { date, completedTasks, totalTasks, percentage, color };
  }

  loadSelectedDayDetails(): void {
    this.selectedDayLoading = true;
    
    this.goalAssignmentService.getActiveAssignmentsByUserId(this.currentUserId).subscribe({
      next: (assignments) => {
        const goalIds = assignments.map(a => a.goalId);
        
        if (goalIds.length === 0) {
          this.selectedDayGoals = [];
          this.selectedDayLoading = false;
          return;
        }

        this.goalService.getGoalsByIds(goalIds).subscribe({
          next: (goals) => {
            const goalObservables = goals.map(goal => 
              this.taskService.getTasksByGoalId(goal.id).pipe(
                map(tasks => ({ goal, tasks }))
              )
            );
            
            forkJoin(goalObservables).subscribe({
              next: (goalsWithTasks) => {
                const dateStr = this.formatDateYYYYMMDD(this.selectedDate);
                
                const logObservables = goalsWithTasks.map(gwt => 
                  this.dailyLogService.getLogsForUserByDate(this.currentUserId, this.selectedDate).pipe(
                    map(logs => ({
                      goal: gwt.goal,
                      completedTasks: logs.filter(log => 
                        gwt.tasks.some(t => t.id === log.taskId) && log.value === true
                      ).length,
                      totalTasks: gwt.tasks.length
                    }))
                  )
                );
                
                forkJoin(logObservables).subscribe({
                  next: (results) => {
                    this.selectedDayGoals = results;
                    this.selectedDayLoading = false;
                  },
                  error: (error) => {
                    console.error('Error loading day details:', error);
                    this.selectedDayLoading = false;
                  }
                });
              },
              error: (error) => {
                console.error('Error loading tasks:', error);
                this.selectedDayLoading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error loading goals:', error);
            this.selectedDayLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        this.selectedDayLoading = false;
      }
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

  getTotalCompletionForSelectedDay(): { completed: number; total: number; percentage: number } {
    const completed = this.selectedDayGoals.reduce((sum, g) => sum + g.completedTasks, 0);
    const total = this.selectedDayGoals.reduce((sum, g) => sum + g.totalTasks, 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }
}
