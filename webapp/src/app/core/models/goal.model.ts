/**
 * Goal Model - Represents a habit/goal
 */
export interface Goal {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date | null;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;
}

export class GoalModel implements Goal {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date | null;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;

  constructor(data: Partial<Goal> = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || null;
    this.active = data.active !== undefined ? data.active : true;
    this.createdDate = data.createdDate || new Date();
    this.updatedDate = data.updatedDate || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  static fromFirestore(id: string, data: any): GoalModel {
    return new GoalModel({
      id,
      name: data.name,
      description: data.description,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || null,
      active: data.active,
      createdDate: data.createdDate?.toDate() || new Date(),
      updatedDate: data.updatedDate?.toDate() || new Date(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    });
  }

  toFirestore(): any {
    return {
      name: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      active: this.active,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}
