import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoalFirebaseService } from '../../../core/services/firebase/goal-firebase.service';
import { TaskFirebaseService } from '../../../core/services/firebase/task-firebase.service';
import { GoalAssignmentFirebaseService } from '../../../core/services/firebase/goal-assignment-firebase.service';
import { Goal } from '../../../core/models/goal.model';
import { TableColumn, TableAction } from '../../../shared/components/common/ht-table/ht-table.component';

@Component({
  selector: 'app-goals-list',
  templateUrl: './goals-list.component.html',
  styleUrls: ['./goals-list.component.css']
})
export class GoalsListComponent implements OnInit {
  goals: Goal[] = [];
  loading: boolean = false;
  columns: TableColumn[] = [];
  actions: TableAction[] = [];

  constructor(
    private goalService: GoalFirebaseService,
    private taskService: TaskFirebaseService,
    private goalAssignmentService: GoalAssignmentFirebaseService,
    private router: Router
  ) {
    this.setupTable();
  }

  ngOnInit(): void {
    this.loadGoals();
  }

  setupTable(): void {
    this.columns = [
      { field: 'name', header: 'Goal Name', sortable: true, filterable: true },
      { field: 'description', header: 'Description', sortable: false, filterable: true },
      { 
        field: 'startDate', 
        header: 'Start Date', 
        sortable: true, 
        filterable: false,
        template: (row: Goal) => this.formatDate(row.startDate)
      },
      { 
        field: 'endDate', 
        header: 'End Date', 
        sortable: true, 
        filterable: false,
        template: (row: Goal) => row.endDate ? this.formatDate(row.endDate) : 'Ongoing'
      },
      { 
        field: 'active', 
        header: 'Status', 
        sortable: true, 
        filterable: false,
        template: (row: Goal) => row.active ? 'Active' : 'Inactive'
      }
    ];

    this.actions = [
      {
        icon: 'pi pi-pencil',
        label: 'Edit',
        severity: 'info',
        tooltip: 'Edit goal',
        visible: () => true,
        handler: (row: Goal) => this.editGoal(row)
      },
      {
        icon: 'pi pi-trash',
        label: 'Delete',
        severity: 'danger',
        tooltip: 'Delete goal',
        visible: () => true,
        handler: (row: Goal) => this.deleteGoal(row)
      }
    ];
  }

  loadGoals(): void {
    this.loading = true;
    this.goalService.getAllGoals().subscribe({
      next: (goals) => {
        this.goals = goals;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.loading = false;
        alert('Failed to load goals');
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  createGoal(): void {
    this.router.navigate(['/admin/goals/create']);
  }

  editGoal(goal: Goal): void {
    this.router.navigate(['/admin/goals/edit', goal.id]);
  }

  deleteGoal(goal: Goal): void {
    if (!confirm(`Are you sure you want to delete "${goal.name}"? This will also delete all tasks and assignments.`)) {
      return;
    }

    this.loading = true;

    // Delete tasks and assignments first
    this.taskService.deleteTasksByGoalId(goal.id).subscribe({
      next: () => {
        this.goalAssignmentService.deleteAssignmentsByGoalId(goal.id).subscribe({
          next: () => {
            this.goalService.deleteGoal(goal.id).subscribe({
              next: () => {
                this.loading = false;
                alert('Goal deleted successfully');
                this.loadGoals();
              },
              error: (error) => {
                console.error('Error deleting goal:', error);
                this.loading = false;
                alert('Failed to delete goal');
              }
            });
          },
          error: (error) => {
            console.error('Error deleting assignments:', error);
            this.loading = false;
            alert('Failed to delete goal assignments');
          }
        });
      },
      error: (error) => {
        console.error('Error deleting tasks:', error);
        this.loading = false;
        alert('Failed to delete goal tasks');
      }
    });
  }
}
