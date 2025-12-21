/**
 * User Model - Represents a user in the system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  fcmToken?: string | null;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;
}

export class UserModel implements User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  fcmToken?: string | null;
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;

  constructor(data: Partial<User> = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || 'user';
    this.fcmToken = data.fcmToken || null;
    this.active = data.active !== undefined ? data.active : true;
    this.createdDate = data.createdDate || new Date();
    this.updatedDate = data.updatedDate || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  static fromFirestore(id: string, data: any): UserModel {
    return new UserModel({
      id,
      name: data.name,
      email: data.email,
      role: data.role,
      fcmToken: data.fcmToken,
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
      email: this.email,
      role: this.role,
      fcmToken: this.fcmToken,
      active: this.active,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}
