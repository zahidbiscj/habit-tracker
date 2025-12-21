/**
 * Task Model - Represents a task within a goal
 */
export interface Task {
  id: string;
  goalId: string;
  name: string;
  type: 'boolean';
  additionalNotes: string;
  position: number;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;
}

export class TaskModel implements Task {
  id: string;
  goalId: string;
  name: string;
  type: 'boolean' = 'boolean';
  additionalNotes: string;
  position: number;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;

  constructor(data: Partial<Task> = {}) {
    this.id = data.id || '';
    this.goalId = data.goalId || '';
    this.name = data.name || '';
    this.type = 'boolean';
    this.additionalNotes = data.additionalNotes || '';
    this.position = data.position || 0;
    this.active = data.active !== undefined ? data.active : true;
    this.createdDate = data.createdDate || new Date();
    this.updatedDate = data.updatedDate || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  static fromFirestore(id: string, data: any): TaskModel {
    return new TaskModel({
      id,
      goalId: data.goalId,
      name: data.name,
      type: 'boolean',
      additionalNotes: data.additionalNotes,
      position: data.position,
      active: data.active,
      createdDate: data.createdDate?.toDate() || new Date(),
      updatedDate: data.updatedDate?.toDate() || new Date(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    });
  }

  toFirestore(): any {
    return {
      goalId: this.goalId,
      name: this.name,
      type: this.type,
      additionalNotes: this.additionalNotes,
      position: this.position,
      active: this.active,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}
