import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGoalService } from '../../../core/services/interfaces/goal.service.interface';
import { ITaskService } from '../../../core/services/interfaces/task.service.interface';
import { IUserService } from '../../../core/services/interfaces/user.service.interface';
import { IGoalAssignmentService } from '../../../core/services/interfaces/goal-assignment.service.interface';
import { IAuthService } from '../../../core/services/interfaces/auth.service.interface';
import { Goal } from '../../../core/models/goal.model';
import { Task } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { forkJoin } from 'rxjs';

interface TaskInput {
  tempId: string;
  id?: string;
  name: string;
  additionalNotes: string;
}

@Component({
  selector: 'app-goal-form',
  templateUrl: './goal-form.component.html',
  styleUrls: ['./goal-form.component.css']
})
export class GoalFormComponent implements OnInit {
  isEditMode: boolean = false;
  goalId: string | null = null;
  
  // Form fields
  goalName: string = '';
  goalDescription: string = '';
  startDate: Date = new Date();
  endDate: Date | null = null;
  tasks: TaskInput[] = [];
  
  // User assignment
  users: User[] = [];
  selectedUserIds: string[] = [];
  
  loading: boolean = false;
  currentUserId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private goalService: IGoalService,
    private taskService: ITaskService,
    private userService: IUserService,
    private goalAssignmentService: IGoalAssignmentService,
    private authService: IAuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId() || '';
    
    // Check if edit mode
    this.goalId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.goalId;
    
    // Load users
    this.loadUsers();
    
    // Load goal if edit mode
    if (this.isEditMode && this.goalId) {
      this.loadGoal(this.goalId);
    } else {
      // Add initial task for new goal
      this.addTask();
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.filter(u => u.active);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadGoal(goalId: string): void {
    this.loading = true;
    
    forkJoin({
      goal: this.goalService.getGoalById(goalId),
      tasks: this.taskService.getTasksByGoalId(goalId),
      assignments: this.goalAssignmentService.getAssignmentsByGoalId(goalId)
    }).subscribe({
      next: (result) => {
        if (result.goal) {
          this.goalName = result.goal.name;
          this.goalDescription = result.goal.description || '';
          this.startDate = new Date(result.goal.startDate);
          this.endDate = result.goal.endDate ? new Date(result.goal.endDate) : null;
          
          this.tasks = result.tasks.map((task, index) => ({
            tempId: `task_${index}`,
            id: task.id,
            name: task.name,
            additionalNotes: task.additionalNotes || ''
          }));
          
          this.selectedUserIds = result.assignments.map(a => a.userId);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading goal:', error);
        this.loading = false;
        alert('Failed to load goal');
        this.router.navigate(['/admin/goals']);
      }
    });
  }

  addTask(): void {
    this.tasks.push({
      tempId: `task_${Date.now()}`,
      name: '',
      additionalNotes: ''
    });
  }

  removeTask(index: number): void {
    if (this.tasks.length > 1) {
      this.tasks.splice(index, 1);
    } else {
      alert('At least one task is required');
    }
  }

  onSubmit(): void {
    // Validation
    if (!this.goalName.trim()) {
      alert('Goal name is required');
      return;
    }

    if (!this.startDate) {
      alert('Start date is required');
      return;
    }

    if (this.tasks.length === 0) {
      alert('At least one task is required');
      return;
    }

    for (let i = 0; i < this.tasks.length; i++) {
      if (!this.tasks[i].name.trim()) {
        alert(`Task ${i + 1} name is required`);
        return;
      }
    }

    this.loading = true;

    if (this.isEditMode && this.goalId) {
      this.updateGoal();
    } else {
      this.createGoal();
    }
  }

  createGoal(): void {
    const goalData = {
      name: this.goalName.trim(),
      description: this.goalDescription.trim(),
      startDate: this.startDate,
      endDate: this.endDate,
      active: true,
      createdDate: new Date(),
      updatedDate: new Date(),
      createdBy: this.currentUserId,
      updatedBy: this.currentUserId
    };

    this.goalService.createGoal(goalData).subscribe({
      next: (goal) => {
        // Create tasks
        const tasksData = this.tasks.map((task, index) => ({
          goalId: goal.id,
          name: task.name.trim(),
          additionalNotes: task.additionalNotes.trim(),
          position: index,
          type: 'boolean' as const,
          active: true,
          createdDate: new Date(),
          updatedDate: new Date(),
          createdBy: this.currentUserId,
          updatedBy: this.currentUserId
        }));

        this.taskService.createTasks(tasksData).subscribe({
          next: () => {
            // Create assignments
            if (this.selectedUserIds.length > 0) {
              this.goalAssignmentService.assignGoalToUsers(goal.id, this.selectedUserIds, this.currentUserId).subscribe({
                next: () => {
                  this.loading = false;
                  alert('Goal created successfully');
                  this.router.navigate(['/admin/goals']);
                },
                error: (error) => {
                  console.error('Error creating assignments:', error);
                  this.loading = false;
                  alert('Goal created but failed to assign users');
                }
              });
            } else {
              this.loading = false;
              alert('Goal created successfully');
              this.router.navigate(['/admin/goals']);
            }
          },
          error: (error) => {
            console.error('Error creating tasks:', error);
            this.loading = false;
            alert('Goal created but failed to create tasks');
          }
        });
      },
      error: (error) => {
        console.error('Error creating goal:', error);
        this.loading = false;
        alert('Failed to create goal');
      }
    });
  }

  updateGoal(): void {
    if (!this.goalId) return;

    const updates = {
      name: this.goalName.trim(),
      description: this.goalDescription.trim(),
      startDate: this.startDate,
      endDate: this.endDate,
      updatedBy: this.currentUserId
    };

    this.goalService.updateGoal(this.goalId, updates).subscribe({
      next: () => {
        // Update tasks - delete old ones and create new ones
        this.taskService.deleteTasksByGoalId(this.goalId!).subscribe({
          next: () => {
            const tasksData = this.tasks.map((task, index) => ({
              goalId: this.goalId!,
              name: task.name.trim(),
              additionalNotes: task.additionalNotes.trim(),
              position: index,
              type: 'boolean' as const,
              active: true,
              createdDate: new Date(),
              updatedDate: new Date(),
              createdBy: this.currentUserId,
              updatedBy: this.currentUserId
            }));

            this.taskService.createTasks(tasksData).subscribe({
              next: () => {
                // Update assignments
                this.goalAssignmentService.deleteAssignmentsByGoalId(this.goalId!).subscribe({
                  next: () => {
                    if (this.selectedUserIds.length > 0) {
                      this.goalAssignmentService.assignGoalToUsers(this.goalId!, this.selectedUserIds, this.currentUserId).subscribe({
                        next: () => {
                          this.loading = false;
                          alert('Goal updated successfully');
                          this.router.navigate(['/admin/goals']);
                        },
                        error: (error) => {
                          console.error('Error updating assignments:', error);
                          this.loading = false;
                          alert('Goal updated but failed to assign users');
                        }
                      });
                    } else {
                      this.loading = false;
                      alert('Goal updated successfully');
                      this.router.navigate(['/admin/goals']);
                    }
                  },
                  error: (error) => {
                    console.error('Error deleting assignments:', error);
                    this.loading = false;
                    alert('Failed to update assignments');
                  }
                });
              },
              error: (error) => {
                console.error('Error creating tasks:', error);
                this.loading = false;
                alert('Goal updated but failed to update tasks');
              }
            });
          },
          error: (error) => {
            console.error('Error deleting tasks:', error);
            this.loading = false;
            alert('Failed to update tasks');
          }
        });
      },
      error: (error) => {
        console.error('Error updating goal:', error);
        this.loading = false;
        alert('Failed to update goal');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/goals']);
  }
}
