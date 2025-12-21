/**
 * Notification Model - Represents scheduled notifications
 */
export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string; // HH:mm format
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;
}

export class NotificationModel implements Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  daysOfWeek: number[];
  active: boolean;
  createdDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;

  constructor(data: Partial<Notification> = {}) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.body = data.body || '';
    this.time = data.time || '09:00';
    this.daysOfWeek = data.daysOfWeek || [];
    this.active = data.active !== undefined ? data.active : true;
    this.createdDate = data.createdDate || new Date();
    this.updatedDate = data.updatedDate || new Date();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  static fromFirestore(id: string, data: any): NotificationModel {
    return new NotificationModel({
      id,
      title: data.title,
      body: data.body,
      time: data.time,
      daysOfWeek: data.daysOfWeek || [],
      active: data.active,
      createdDate: data.createdDate?.toDate() || new Date(),
      updatedDate: data.updatedDate?.toDate() || new Date(),
      createdBy: data.createdBy,
      updatedBy: data.updatedBy
    });
  }

  toFirestore(): any {
    return {
      title: this.title,
      body: this.body,
      time: this.time,
      daysOfWeek: this.daysOfWeek,
      active: this.active,
      createdDate: this.createdDate,
      updatedDate: this.updatedDate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }

  getDaysString(): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (this.daysOfWeek.length === 7) return 'Everyday';
    return this.daysOfWeek.map(d => dayNames[d]).join(', ');
  }
}
