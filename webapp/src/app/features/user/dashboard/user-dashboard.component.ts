// (Removed duplicate misplaced touch event handlers)
import { Component, OnInit } from '@angular/core';
import { AuthFirebaseService } from '../../../core/services/firebase/auth-firebase.service';
import { GoalAssignmentFirebaseService } from '../../../core/services/firebase/goal-assignment-firebase.service';
import { GoalFirebaseService } from '../../../core/services/firebase/goal-firebase.service';
import { TaskFirebaseService } from '../../../core/services/firebase/task-firebase.service';
import { DailyLogFirebaseService } from '../../../core/services/firebase/daily-log-firebase.service';
import { Goal } from '../../../core/models/goal.model';
import { Task } from '../../../core/models/task.model';
import { forkJoin, from } from 'rxjs';
import { isTaskVisibleOnDate } from '../../../core/utils/schedule.util';

interface GoalWithTasks {
  goal: Goal;
  tasks: Task[];
  completionPercentage: number;
  completedToday: boolean;
}

interface NextTaskInfo {
  task: Task;
  goalName: string;
  timeLeftDisplay: string;
  deadlineDisplay: string;
  progressValue: number;
  progressColor: string;
  hoursLeft: number;
  minsLeft: number;
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
  sliderValue: number = 1;
  loading: boolean = false;
  showDailyEntryModal: boolean = false;
  nextTaskInfo: NextTaskInfo | null = null;
  upcomingTasks: NextTaskInfo[] = [];
  currentTaskIndex: number = 0;

  // Drag/Swipe state
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragCurrentX: number = 0;
  dragTranslateX: number = 0;
  dragThreshold: number = 50;

  onSliderChange(event: any): void {
    const value = Number(event.target.value);
    this.currentTaskIndex = value - 1;
    this.updateDisplayedTask();
  }


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
    console.log('Loading dashboard data for user:', this.currentUserId);
    console.log('Selected date:', this.selectedDate);
    
    // Get user's goal assignments
    this.goalAssignmentService.getActiveAssignmentsByUserId(this.currentUserId).subscribe({
      next: (assignments) => {
        console.log('Found assignments:', assignments);
        if (assignments.length === 0) {
          this.goalsWithTasks = [];
          this.loading = false;
          return;
        }

        // Extract goal IDs from assignments
        const goalIds = assignments.map(a => a.goalId);
        console.log('Goal IDs to filter:', goalIds);
        
        // Get goals filtered by date range on Firebase side
        this.goalService.getGoalsForUserOnDate(goalIds, this.selectedDate).subscribe({
          next: (goals) => {
            console.log('Goals filtered by date from Firebase:', goals);
            
            if (goals.length === 0) {
              this.goalsWithTasks = [];
              this.loading = false;
              return;
            }
            
            // Get tasks for each goal
            const goalTaskObservables = goals.map(goal => 
              forkJoin({
                goal: from(Promise.resolve(goal)),
                tasks: this.taskService.getActiveTasksByGoalId(goal.id)
              })
            );

            forkJoin(goalTaskObservables).subscribe({
              next: (results) => {
                console.log('Loaded goals and tasks:', results);
                
                // Get aggregated daily log for selected date to calculate completion
                this.dailyLogService.getDailyLogByUserAndDate(this.currentUserId, this.selectedDate).subscribe({
                  next: (dailyLog) => {
                    console.log('Loaded aggregated daily log:', dailyLog);
                    const tasksEntries = dailyLog?.tasks || [];
                    this.goalsWithTasks = results
                      .map(result => {
                        // Filter tasks to only show those visible on selected date
                        const visibleTasks = result.tasks.filter(t => 
                          isTaskVisibleOnDate(t, result.goal, this.selectedDate)
                        );
                        const goalTaskIds = new Set(visibleTasks.map(t => t.id));
                        const entriesForGoal = tasksEntries.filter(e => goalTaskIds.has(e.taskId));
                        const completedCount = entriesForGoal.filter(e => !!e.value).length;
                        const totalTasks = visibleTasks.length;
                        const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
                        const completedToday = completedCount === totalTasks && totalTasks > 0;

                        return {
                          goal: result.goal,
                          tasks: visibleTasks,
                          completionPercentage: percentage,
                          completedToday,
                          completedCount
                        };
                      })
                      .filter(goalData => goalData.tasks.length > 0); // Remove goals with no visible tasks

                    console.log('Final goalsWithTasks:', this.goalsWithTasks);
                    this.calculateNextTask(tasksEntries);
                    this.loading = false;
                  },
              error: (error) => {
                console.error('Error loading logs:', error);
                this.loading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error loading goals and tasks:', error);
            this.loading = false;
          }
        });
          },
          error: (error) => {
            console.error('Error loading goals filtered by date:', error);
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

  calculateNextTask(tasksEntries: any[]): void {
    if (!this.isToday(this.selectedDate)) {
      this.nextTaskInfo = null;
      this.upcomingTasks = [];
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

    // Get all incomplete tasks with lastTimeToComplete
    const incompleteTasks: Array<{ task: Task; goalName: string; deadline: number }> = [];

    for (const goalData of this.goalsWithTasks) {
      for (const task of goalData.tasks) {
        // COMPREHENSIVE CHECK: Task must be visible on this date
        // (goal active + matching day-of-week + task active)
        if (!isTaskVisibleOnDate(task, goalData.goal, now)) continue;
        if (!task.lastTimeToComplete) continue;

        // Check if task is completed
        const taskEntry = tasksEntries.find(e => e.taskId === task.id);
        if (taskEntry && taskEntry.value) continue; // Skip completed tasks

        // Parse lastTimeToComplete (HH:mm format)
        const [hours, minutes] = task.lastTimeToComplete.split(':').map(Number);
        const deadlineMinutes = hours * 60 + minutes;

        // Only include tasks that haven't passed deadline
        if (deadlineMinutes >= currentTime) {
          incompleteTasks.push({
            task,
            goalName: goalData.goal.name,
            deadline: deadlineMinutes
          });
        }
      }
    }

    if (incompleteTasks.length === 0) {
      this.nextTaskInfo = null;
      this.upcomingTasks = [];
      return;
    }

    // Sort by deadline (earliest first)
    incompleteTasks.sort((a, b) => a.deadline - b.deadline);

    // Build upcoming tasks list
    this.upcomingTasks = incompleteTasks.map(it => {
      const deadlineMinutes = it.deadline;
      const minutesLeft = deadlineMinutes - currentTime;

      const hoursLeft = Math.max(0, Math.floor(minutesLeft / 60));
      const minsLeft = Math.max(0, minutesLeft % 60);
      let timeLeftDisplay = '';
      if (minutesLeft > 0) {
        if (hoursLeft > 0) {
          timeLeftDisplay = `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`;
          if (minsLeft > 0) {
            timeLeftDisplay += ` ${minsLeft} minute${minsLeft > 1 ? 's' : ''}`;
          }
        } else {
          timeLeftDisplay = `${minsLeft} minute${minsLeft > 1 ? 's' : ''}`;
        }
        timeLeftDisplay += ' left';
      } else {
        timeLeftDisplay = '0 minute left';
      }

      const deadlineHours = Math.floor(deadlineMinutes / 60);
      const deadlineMins = deadlineMinutes % 60;
      // Format deadline as hh:mm AM/PM
      let ampm = 'AM';
      let displayHour = deadlineHours;
      if (displayHour === 0) {
        displayHour = 12;
      } else if (displayHour >= 12) {
        ampm = 'PM';
        if (displayHour > 12) displayHour -= 12;
      }
      const deadlineDisplay = `${displayHour}:${String(deadlineMins).padStart(2, '0')} ${ampm}`;


      // Progress bar: visually match urgency
      let progressValue = 100;
      let progressColor = '#4caf50'; // green
      if (minutesLeft <= 15) {
        progressValue = 10;
        progressColor = '#f44336'; // red
      } else if (minutesLeft <= 30) {
        progressValue = 30;
        progressColor = '#ff9800'; // orange
      } else if (minutesLeft <= 60) {
        progressValue = 60;
        progressColor = '#ffeb3b'; // yellow
      }

      return {
        task: it.task,
        goalName: it.goalName,
        timeLeftDisplay,
        deadlineDisplay,
        progressValue,
        progressColor,
        hoursLeft,
        minsLeft
      } as NextTaskInfo;
    });

    this.currentTaskIndex = 0;
    this.updateDisplayedTask();
  }

  private updateDisplayedTask(): void {
    if (this.upcomingTasks.length === 0) {
      this.nextTaskInfo = null;
      return;
    }
    const clampedIndex = Math.max(0, Math.min(this.currentTaskIndex, this.upcomingTasks.length - 1));
    this.currentTaskIndex = clampedIndex;
    this.nextTaskInfo = this.upcomingTasks[this.currentTaskIndex];
  }

  goToNextTask(): void {
    if (this.currentTaskIndex < this.upcomingTasks.length - 1) {
      this.currentTaskIndex++;
      this.updateDisplayedTask();
    }
  }

  goToPrevTask(): void {
    if (this.currentTaskIndex > 0) {
      this.currentTaskIndex--;
      this.updateDisplayedTask();
    }
  }

  // Pointer events for swipe/drag on both touch and desktop
  onPointerDown(event: PointerEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragCurrentX = event.clientX;
    this.dragTranslateX = 0;
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;
    this.dragCurrentX = event.clientX;
    this.dragTranslateX = this.dragCurrentX - this.dragStartX;
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isDragging) return;
    const deltaX = this.dragTranslateX;
    this.isDragging = false;
    this.dragTranslateX = 0;

    if (deltaX <= -this.dragThreshold) {
      this.goToNextTask();
    } else if (deltaX >= this.dragThreshold) {
      this.goToPrevTask();
    }
  }

  onPointerCancel(): void {
    this.isDragging = false;
    this.dragTranslateX = 0;
  }
}
