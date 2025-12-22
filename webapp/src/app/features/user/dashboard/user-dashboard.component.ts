import { Component, OnInit } from '@angular/core';
import { AuthFirebaseService } from '../../../core/services/firebase/auth-firebase.service';
import { GoalAssignmentFirebaseService } from '../../../core/services/firebase/goal-assignment-firebase.service';
import { GoalFirebaseService } from '../../../core/services/firebase/goal-firebase.service';
import { TaskFirebaseService } from '../../../core/services/firebase/task-firebase.service';
import { DailyLogFirebaseService } from '../../../core/services/firebase/daily-log-firebase.service';
import { Goal } from '../../../core/models/goal.model';
import { Task } from '../../../core/models/task.model';
import { forkJoin } from 'rxjs';

interface GoalWithTasks {
  goal: Goal;
  tasks: Task[];
  completionPercentage: number;
  completedToday: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  currentUserId: string = '';
  
  goalsWithTasks: GoalWithTasks[] = [];
  loading: boolean = false;
  showDailyEntryModal: boolean = false;

  // Month selector
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  constructor(
    private authService: AuthFirebaseService,
    private goalAssignmentService: GoalAssignmentFirebaseService,
    private goalService: GoalFirebaseService,
    private taskService: TaskFirebaseService,
    private dailyLogService: DailyLogFirebaseService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId() || '';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Get user's goal assignments
    this.goalAssignmentService.getActiveAssignmentsByUserId(this.currentUserId).subscribe({
      next: (assignments) => {
        if (assignments.length === 0) {
          this.goalsWithTasks = [];
          this.loading = false;
          return;
        }

        // Get goals and tasks for each assignment
        const goalObservables = assignments.map(assignment => 
          forkJoin({
            goal: this.goalService.getGoalById(assignment.goalId),
            tasks: this.taskService.getActiveTasksByGoalId(assignment.goalId)
          })
        );

        forkJoin(goalObservables).subscribe({
          next: (results) => {
            const validResults = results.filter(r => r.goal !== null) as { goal: Goal; tasks: Task[] }[];
            
            // Get today's logs to calculate completion
            this.dailyLogService.getLogsByUserAndDate(this.currentUserId, this.selectedDate).subscribe({
              next: (logs) => {
                this.goalsWithTasks = validResults.map(result => {
                  const taskIds = result.tasks.map(t => t.id);
                  const logsForGoal = logs.filter(log => taskIds.includes(log.taskId));
                  const completedCount = logsForGoal.filter(log => log.value).length;
                  const totalTasks = result.tasks.length;
                  const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
                  const completedToday = logsForGoal.length === totalTasks;

                  return {
                    goal: result.goal,
                    tasks: result.tasks,
                    completionPercentage: percentage,
                    completedToday
                  };
                });
                
                this.loading = false;
              },
              error: (error) => {
                console.error('Error loading logs:', error);
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

  onMonthChange(): void {
    this.selectedDate = new Date(this.selectedYear, this.selectedMonth, this.selectedDate.getDate());
    this.loadDashboardData();
  }

  goToPreviousDay(): void {
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();
    this.loadDashboardData();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();
    this.loadDashboardData();
  }

  goToNextDay(): void {
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();
    this.loadDashboardData();
  }

  openDailyEntryModal(): void {
    this.showDailyEntryModal = true;
  }

  onDailyEntrySaved(): void {
    this.showDailyEntryModal = false;
    this.loadDashboardData();
  }

  getCompletionColor(percentage: number): string {
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 60) return '#ffeb3b'; // Yellow
    if (percentage >= 40) return '#ff9800'; // Orange
    return '#9e9e9e'; // Gray
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}
