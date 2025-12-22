/**
 * DailyLog Model - Represents a daily task completion log
 */
export interface DailyLog {
  id: string;
  date: Date;
  taskId: string;
  goalId: string;
  userId: string;
  value: boolean;
  notes?: string;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;
}

export class DailyLogModel implements DailyLog {
  id: string;
  date: Date;
  taskId: string;
  goalId: string;
  userId: string;
  value: boolean;
  notes?: string;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;

  constructor(data: Partial<DailyLog> = {}) {
    this.id = data.id || '';
    this.date = data.date || new Date();
    this.taskId = data.taskId || '';
    this.goalId = data.goalId || '';
    this.userId = data.userId || '';
    this.value = data.value || false;
    this.notes = data.notes || '';
    this.active = data.active !== undefined ? data.active : true;
    this.createdDate = data.createdDate || new Date();
    this.updatedDate = data.updatedDate || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  static fromFirestore(id: string, data: any): DailyLogModel {
    return new DailyLogModel({
      id,
      date: data.date?.toDate() || new Date(),
      taskId: data.taskId,
      goalId: data.goalId,
      userId: data.userId,
      value: data.value,
      notes: data.notes,
      active: data.active,
      createdDate: data.createdDate?.toDate() || new Date(),
      updatedDate: data.updatedDate?.toDate() || new Date(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    });
  }

  toFirestore(): any {
    return {
      date: this.date,
      taskId: this.taskId,
      goalId: this.goalId,
      userId: this.userId,
      value: this.value,
      notes: this.notes,
      active: this.active,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}
