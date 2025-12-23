/**
 * DailyLog Model - Aggregated per user per day
 */
export interface DailyTaskEntry {
  taskId: string;
  goalId: string;
  taskName?: string;
  goalName?: string;
  value: boolean;
  notes?: string;
  updatedAt?: Date;
}

export interface DailyLog {
  id: string; // `${userId}-${YYYYMMDD}`
  userId: string;
  date: Date;
  dateTimestamp?: Date;
  month?: string; // YYYY-MM
  week?: number; // 1-53
  year?: number;
  tasks: DailyTaskEntry[];
  goalIds?: string[];
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy?: string;
  updatedBy?: string;
}

export class DailyLogModel implements DailyLog {
  id: string;
  userId: string;
  date: Date;
  dateTimestamp?: Date;
  month?: string;
  week?: number;
  year?: number;
  tasks: DailyTaskEntry[];
  goalIds?: string[];
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy?: string;
  updatedBy?: string;

  constructor(data: Partial<DailyLog> = {}) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.date = data.date || new Date();
    this.dateTimestamp = data.dateTimestamp || data.date || new Date();
    this.month = data.month;
    this.week = data.week;
    this.year = data.year;
    this.tasks = data.tasks || [];
    this.goalIds = data.goalIds || this.tasks.map(t => t.goalId).filter(Boolean);
    this.active = data.active !== undefined ? data.active : true;
    this.createdDate = data.createdDate || new Date();
    this.updatedDate = data.updatedDate || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  static fromFirestore(id: string, data: any): DailyLogModel {
    const tasks: DailyTaskEntry[] = Array.isArray(data.tasks)
      ? data.tasks.map((t: any) => ({
          taskId: t.taskId,
          goalId: t.goalId,
          taskName: t.taskName,
          goalName: t.goalName,
          value: !!t.value,
          notes: t.notes,
          updatedAt: t.updatedAt?.toDate ? t.updatedAt.toDate() : (t.updatedAt ? new Date(t.updatedAt) : undefined)
        }))
      : [];

    return new DailyLogModel({
      id,
      userId: data.userId,
      date: data.date?.toDate ? data.date.toDate() : (data.date ? new Date(data.date) : new Date()),
      dateTimestamp: data.dateTimestamp?.toDate ? data.dateTimestamp.toDate() : (data.dateTimestamp ? new Date(data.dateTimestamp) : undefined),
      month: data.month,
      week: data.week,
      year: data.year,
      tasks,
      goalIds: data.goalIds,
      active: data.active,
      createdDate: data.createdDate?.toDate ? data.createdDate.toDate() : (data.createdDate ? new Date(data.createdDate) : new Date()),
      updatedDate: data.updatedDate?.toDate ? data.updatedDate.toDate() : (data.updatedDate ? new Date(data.updatedDate) : new Date()),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    });
  }

  toFirestore(): any {
    return {
      userId: this.userId,
      date: this.date,
      dateTimestamp: this.dateTimestamp || this.date,
      month: this.month,
      week: this.week,
      year: this.year,
      tasks: this.tasks.map(t => ({
        taskId: t.taskId,
        goalId: t.goalId,
        taskName: t.taskName,
        goalName: t.goalName,
        value: !!t.value,
        notes: t.notes,
        updatedAt: t.updatedAt || this.updatedDate
      })),
      goalIds: this.goalIds || this.tasks.map(t => t.goalId).filter(Boolean),
      active: this.active,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}
