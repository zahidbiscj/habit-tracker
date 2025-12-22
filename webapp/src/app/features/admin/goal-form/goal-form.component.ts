import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoalFirebaseService } from '../../../core/services/firebase/goal-firebase.service';
import { TaskFirebaseService } from '../../../core/services/firebase/task-firebase.service';
import { UserFirebaseService } from '../../../core/services/firebase/user-firebase.service';
import { GoalAssignmentFirebaseService } from '../../../core/services/firebase/goal-assignment-firebase.service';
import { AuthFirebaseService } from '../../../core/services/firebase/auth-firebase.service';
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
    private goalService: GoalFirebaseService,
    private taskService: TaskFirebaseService,
    private userService: UserFirebaseService,
    private goalAssignmentService: GoalAssignmentFirebaseService,
    private authService: AuthFirebaseService
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
    console.log('Loading goal with ID:', goalId);
    this.loading = true;
    
    forkJoin({
      goal: this.goalService.getGoalById(goalId),
      tasks: this.taskService.getTasksByGoalId(goalId),
      assignments: this.goalAssignmentService.getAssignmentsByGoalId(goalId)
    }).subscribe({
      next: (result) => {
        console.log('Loaded goal data:', result);
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
          console.log('Loaded assigned user IDs:', this.selectedUserIds);
          console.log('Available users:', this.users);
        } else {
          console.error('Goal not found');
          alert('Goal not found');
          this.router.navigate(['/admin/goals']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading goal:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.loading = false;
        alert('Failed to load goal: ' + (error.message || 'Unknown error'));
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
    const goalData: Goal = {
      id: this.generateId(), // Generate temporary ID
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
        const tasksData: Task[] = this.tasks.map((task, index) => ({
          id: this.generateId(), // Generate temporary ID
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

    // Load current goal first to get all fields
    this.goalService.getGoalById(this.goalId).subscribe({
      next: (currentGoal) => {
        if (!currentGoal) {
          alert('Goal not found');
          this.loading = false;
          return;
        }

        const updatedGoal: Goal = {
          ...currentGoal,
          name: this.goalName.trim(),
          description: this.goalDescription.trim(),
          startDate: this.startDate,
          endDate: this.endDate,
          updatedDate: new Date(),
          updatedBy: this.currentUserId
        };

        this.goalService.updateGoal(updatedGoal).subscribe({
          next: () => {
            // Update tasks - delete old ones and create new ones
            this.taskService.deleteTasksByGoalId(this.goalId!).subscribe({
              next: () => {
                const tasksData: Task[] = this.tasks.map((task, index) => ({
              id: this.generateId(), // Generate temporary ID
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
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/goals']);
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUserIds.includes(userId);
  }

  toggleUserSelection(userId: string): void {
    const index = this.selectedUserIds.indexOf(userId);
    if (index > -1) {
      this.selectedUserIds.splice(index, 1);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
