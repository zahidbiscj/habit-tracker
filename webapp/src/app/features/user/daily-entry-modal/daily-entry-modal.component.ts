import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DailyLogFirebaseService } from '../../../core/services/firebase/daily-log-firebase.service';
import { AuthFirebaseService } from '../../../core/services/firebase/auth-firebase.service';
import { DailyTaskEntry, DailyLog } from '../../../core/models/daily-log.model';
import { Goal } from '../../../core/models/goal.model';
import { Task } from '../../../core/models/task.model';
//

interface GoalWithTasks {
  goal: Goal;
  tasks: Task[];
  completionPercentage: number;
  completedToday: boolean;
}

interface TaskLog {
  task: Task;
  value: boolean;
  notes: string;
  logId?: string;
}

@Component({
  selector: 'app-daily-entry-modal',
  templateUrl: './daily-entry-modal.component.html',
  styleUrls: ['./daily-entry-modal.component.css']
})
export class DailyEntryModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() selectedDate: Date = new Date();
  @Input() goalsWithTasks: GoalWithTasks[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  taskLogs: Map<string, TaskLog> = new Map();
  loading: boolean = false;
  saving: boolean = false;
  currentUserId: string = '';

  constructor(
    private dailyLogService: DailyLogFirebaseService,
    private authService: AuthFirebaseService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId() || '';
    this.loadExistingLogs();
  }

  loadExistingLogs(): void {
    this.loading = true;

    // Load aggregated daily log for the selected date
    this.dailyLogService.getDailyLogByUserAndDate(this.currentUserId, this.selectedDate).subscribe({
      next: (dailyLog: DailyLog | null) => {
        const entries: DailyTaskEntry[] = dailyLog?.tasks || [];
        // Initialize task logs with existing data
        this.goalsWithTasks.forEach(goalData => {
          goalData.tasks.forEach(task => {
            const existingEntry = entries.find((e: DailyTaskEntry) => e.taskId === task.id);
            this.taskLogs.set(task.id, {
              task: task,
              value: existingEntry ? !!existingEntry.value : false,
              notes: existingEntry ? existingEntry.notes || '' : '',
              logId: dailyLog?.id
            });
          });
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading existing logs:', error);
        // Initialize with empty values
        this.goalsWithTasks.forEach(goalData => {
          goalData.tasks.forEach(task => {
            this.taskLogs.set(task.id, {
              task: task,
              value: false,
              notes: ''
            });
          });
        });
        this.loading = false;
      }
    });
  }

  toggleTaskCompletion(taskId: string): void {
    const taskLog = this.taskLogs.get(taskId);
    if (taskLog) {
      taskLog.value = !taskLog.value;
      this.taskLogs.set(taskId, taskLog);
    }
  }

  updateTaskNotes(taskId: string, notes: string): void {
    const taskLog = this.taskLogs.get(taskId);
    if (taskLog) {
      taskLog.notes = notes;
      this.taskLogs.set(taskId, taskLog);
    }
  }

  saveLogs(): void {
    this.saving = true;
    const entries: DailyTaskEntry[] = [];
    const now = new Date();

    this.taskLogs.forEach((taskLog, taskId) => {
      const goalData = this.getGoalDataForTask(taskId);
      entries.push({
        taskId: taskId,
        goalId: goalData.goalId,
        taskName: taskLog.task.name,
        goalName: goalData.goalName,
        value: taskLog.value,
        notes: taskLog.notes,
        updatedAt: now
      });
    });

    this.dailyLogService.upsertTaskEntries(this.currentUserId, this.selectedDate, entries).subscribe({
      next: () => {
        this.saving = false;
        this.onSave.emit();
        this.close();
      },
      error: (error: any) => {
        console.error('Error saving logs:', error);
        alert('Failed to save entries. Please try again.');
        this.saving = false;
      }
    });
  }

  getGoalIdForTask(taskId: string): string {
    for (const goalData of this.goalsWithTasks) {
      const task = goalData.tasks.find(t => t.id === taskId);
      if (task) {
        return goalData.goal.id;
      }
    }
    return '';
  }

  getGoalDataForTask(taskId: string): { goalId: string; goalName: string } {
    for (const goalData of this.goalsWithTasks) {
      const task = goalData.tasks.find(t => t.id === taskId);
      if (task) {
        return {
          goalId: goalData.goal.id,
          goalName: goalData.goal.name
        };
      }
    }
    return { goalId: '', goalName: '' };
  }

  close(): void {
    this.onClose.emit();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  getCompletedCount(): number {
    let count = 0;
    this.taskLogs.forEach(log => {
      if (log.value) count++;
    });
    return count;
  }

  getTotalTasks(): number {
    return this.taskLogs.size;
  }
}
