/**
 * GoalAssignment Model - Represents goal assignment to users
 */
export interface GoalAssignment {
  goalId: string;
  userId: string;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;
}

export class GoalAssignmentModel implements GoalAssignment {
  goalId: string;
  userId: string;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;

  constructor(data: Partial<GoalAssignment> = {}) {
    this.goalId = data.goalId || '';
    this.userId = data.userId || '';
    this.active = data.active !== undefined ? data.active : true;
    this.createdDate = data.createdDate || new Date();
    this.updatedDate = data.updatedDate || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  static fromFirestore(data: any): GoalAssignmentModel {
    return new GoalAssignmentModel({
      goalId: data.goalId,
      userId: data.userId,
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
      userId: this.userId,
      active: this.active,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }

  get id(): string {
    return `${this.goalId}_${this.userId}`;
  }
}
