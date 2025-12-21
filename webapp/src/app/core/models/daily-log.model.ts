/**
 * DailyLog Model - Represents a daily task completion log
 */
export interface DailyLog {
  id: string;
  date: Date;
  taskId: string;
  userId: string;
  value: boolean;
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
  userId: string;
  value: boolean;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;

  constructor(data: Partial<DailyLog> = {}) {
    this.id = data.id || '';
    this.date = data.date || new Date();
    this.taskId = data.taskId || '';
    this.userId = data.userId || '';
    this.value = data.value || false;
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
      userId: data.userId,
      value: data.value,
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
      userId: this.userId,
      value: this.value,
      active: this.active,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}
