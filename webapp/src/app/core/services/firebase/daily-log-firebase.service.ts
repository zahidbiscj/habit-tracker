import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
         query, where, orderBy, writeBatch, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { IDailyLogService } from '../interfaces/daily-log.service.interface';
import { DailyLog, DailyLogModel, DailyTaskEntry } from '../../models/daily-log.model';

@Injectable({
  providedIn: 'root'
})
export class DailyLogFirebaseService implements IDailyLogService {
  private collectionName = 'dailyLogs';

  constructor(private firestore: Firestore) {}

  getLogById(logId: string): Observable<DailyLog | null> {
    const docRef = doc(this.firestore, `${this.collectionName}/${logId}`);
    return from(getDoc(docRef)).pipe(
      map((docSnap: any) => {
        if (docSnap.exists()) {
          return DailyLogModel.fromFirestore(docSnap.id, docSnap.data());
        }
        return null;
      })
    );
  }
  /** Aggregated: get daily log for user/date (composite ID) */
  getDailyLogByUserAndDate(userId: string, date: Date): Observable<DailyLog | null> {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const id = `${userId}-${yyyy}${mm}${dd}`;
    return this.getLogById(id);
  }

  /** Aggregated: get logs in date range */
  getDailyLogsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Observable<DailyLog[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end)),
      orderBy('date', 'asc')
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot: any) => querySnapshot.docs.map((doc: any) => DailyLogModel.fromFirestore(doc.id, doc.data())))
    );
  }

  /** Aggregated: get logs in a month (YYYY-MM) */
  getDailyLogsByUserAndMonth(userId: string, month: string): Observable<DailyLog[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      where('month', '==', month),
      orderBy('date', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((querySnapshot: any) => querySnapshot.docs.map((doc: any) => DailyLogModel.fromFirestore(doc.id, doc.data())))
    );
  }

  /** Upsert a single task entry into aggregated log */
  upsertTaskEntry(userId: string, date: Date, entry: DailyTaskEntry): Observable<DailyLog> {
    return this.getDailyLogByUserAndDate(userId, date).pipe(
      switchMap((existing: DailyLog | null) => {
        const yyyy = date.getFullYear();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const id = `${userId}-${yyyy}${mm}${dd}`;
        const month = `${yyyy}-${mm}`;
        const week = getWeekNumber(date);
        const year = yyyy;

        const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
        const baseTasks = existing?.tasks || [];
        const updatedTasks = upsertTasks(baseTasks, [entry], new Date());
        const payload = {
          userId,
          date: Timestamp.fromDate(date),
          dateTimestamp: Timestamp.fromDate(date),
          month,
          week,
          year,
          tasks: updatedTasks.map(t => ({ 
            taskId: t.taskId,
            goalId: t.goalId,
            taskName: t.taskName,
            goalName: t.goalName,
            value: t.value,
            notes: t.notes,
            updatedAt: t.updatedAt || new Date()
          })),
          goalIds: Array.from(new Set(updatedTasks.map(t => t.goalId).filter(Boolean))),
          active: existing?.active ?? true,
          createdDate: existing ? existing.createdDate : serverTimestamp(),
          updatedDate: serverTimestamp(),
          createdBy: existing ? existing.createdBy : userId,
          updatedBy: userId
        } as any;

        if (existing) {
          return from(updateDoc(docRef, payload)).pipe(map(() => new DailyLogModel({ id, ...convertTimestampsToDates(payload) })));
        } else {
          return from(setDoc(docRef, payload)).pipe(map(() => new DailyLogModel({ id, ...convertTimestampsToDates(payload) })));
        }
      })
    );
  }

  /** Upsert multiple task entries */
  upsertTaskEntries(userId: string, date: Date, entries: DailyTaskEntry[]): Observable<DailyLog> {
    return this.getDailyLogByUserAndDate(userId, date).pipe(
      switchMap((existing: DailyLog | null) => {
        const yyyy = date.getFullYear();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        const id = `${userId}-${yyyy}${mm}${dd}`;
        const month = `${yyyy}-${mm}`;
        const week = getWeekNumber(date);
        const year = yyyy;
        const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
        const baseTasks = existing?.tasks || [];
        const updatedTasks = upsertTasks(baseTasks, entries, new Date());
        const payload = {
          userId,
          date: Timestamp.fromDate(date),
          dateTimestamp: Timestamp.fromDate(date),
          month,
          week,
          year,
          tasks: updatedTasks.map(t => ({ 
            taskId: t.taskId,
            goalId: t.goalId,
            taskName: t.taskName,
            goalName: t.goalName,
            value: t.value,
            notes: t.notes,
            // Avoid serverTimestamp in arrays; use client time
            updatedAt: t.updatedAt || new Date()
          })),
          goalIds: Array.from(new Set(updatedTasks.map(t => t.goalId).filter(Boolean))),
          active: existing?.active ?? true,
          createdDate: existing ? existing.createdDate : serverTimestamp(),
          updatedDate: serverTimestamp(),
          createdBy: existing ? existing.createdBy : userId,
          updatedBy: userId
        } as any;

        if (existing) {
          return from(updateDoc(docRef, payload)).pipe(map(() => new DailyLogModel({ id, ...convertTimestampsToDates(payload) })));
        } else {
          return from(setDoc(docRef, payload)).pipe(map(() => new DailyLogModel({ id, ...convertTimestampsToDates(payload) })));
        }
      })
    );
  }

  /** Upsert entire daily log */
  upsertDailyLog(log: DailyLog): Observable<DailyLog> {
    const yyyy = log.date.getFullYear();
    const mm = (log.date.getMonth() + 1).toString().padStart(2, '0');
    const dd = log.date.getDate().toString().padStart(2, '0');
    const id = `${log.userId}-${yyyy}${mm}${dd}`;
    const month = `${yyyy}-${mm}`;
    const week = getWeekNumber(log.date);
    const year = yyyy;
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);

    const payload: any = {
      userId: log.userId,
      date: Timestamp.fromDate(log.date),
      dateTimestamp: Timestamp.fromDate(log.date),
      month,
      week,
      year,
      tasks: (log.tasks || []).map(t => ({ 
        taskId: t.taskId,
        goalId: t.goalId,
        taskName: t.taskName,
        goalName: t.goalName,
        value: t.value,
        notes: t.notes,
        // Avoid serverTimestamp in arrays; use client time
        updatedAt: t.updatedAt || new Date()
      })),
      goalIds: Array.from(new Set((log.tasks || []).map(t => t.goalId).filter(Boolean))),
      active: log.active,
      createdDate: serverTimestamp(),
      updatedDate: serverTimestamp(),
      createdBy: log.createdBy,
      updatedBy: log.updatedBy
    };

    return this.getLogById(id).pipe(
      switchMap((existing: DailyLog | null) => existing
        ? from(updateDoc(docRef, payload)).pipe(map(() => new DailyLogModel({ id, ...convertTimestampsToDates(payload) })))
        : from(setDoc(docRef, payload)).pipe(map(() => new DailyLogModel({ id, ...convertTimestampsToDates(payload) })))
      )
    );
  }

  deleteLog(logId: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${logId}`);
    return from(deleteDoc(docRef)).pipe(
      map(() => void 0)
    );
  }
  getCompletionStats(userId: string, startDate: Date, endDate: Date): Observable<{ totalDays: number; avgCompletionRate: number; fullyCompletedDays: number; partiallyCompletedDays: number; pendingDays: number }> {
    return this.getDailyLogsByUserAndDateRange(userId, startDate, endDate).pipe(
      map((logs: DailyLog[]) => {
        const totalDays = logs.length;
        const completionRates = logs.map((log: DailyLog) => {
          const completed = log.tasks.filter(t => t.value).length;
          const total = log.tasks.length;
          return total > 0 ? Math.round((completed / total) * 100) : 0;
        });
        const avgCompletionRate = totalDays > 0 ? Math.round(completionRates.reduce((a: number, b: number) => a + b, 0) / totalDays) : 0;
        const fullyCompletedDays = logs.filter((log: DailyLog) => {
          const completed = log.tasks.filter(t => t.value).length;
          return completed === log.tasks.length && log.tasks.length > 0;
        }).length;
        const partiallyCompletedDays = logs.filter((log: DailyLog) => {
          const completed = log.tasks.filter(t => t.value).length;
          return completed > 0 && completed < log.tasks.length;
        }).length;
        const pendingDays = logs.filter((log: DailyLog) => {
          const completed = log.tasks.filter(t => t.value).length;
          return completed === 0;
        }).length;
        return { totalDays, avgCompletionRate, fullyCompletedDays, partiallyCompletedDays, pendingDays };
      })
    );
  }
}

/** Helpers */
function upsertTasks(base: DailyTaskEntry[], updates: DailyTaskEntry[], now: Date): DailyTaskEntry[] {
  const mapByTask = new Map<string, DailyTaskEntry>();
  base.forEach(t => mapByTask.set(t.taskId, { ...t }));
  updates.forEach(u => {
    mapByTask.set(u.taskId, {
      ...mapByTask.get(u.taskId),
      ...u,
      updatedAt: now
    } as DailyTaskEntry);
  });
  return Array.from(mapByTask.values());
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
}

function convertTimestampsToDates(payload: any): any {
  // Convert serverTimestamp placeholders where necessary
  const copy = { ...payload };
  // Note: in runtime these are Timestamps, but for model construction we fallback to current Date
  copy.date = copy.date?.toDate ? copy.date.toDate() : new Date();
  copy.dateTimestamp = copy.dateTimestamp?.toDate ? copy.dateTimestamp.toDate() : copy.date;
  copy.createdDate = new Date();
  copy.updatedDate = new Date();
  copy.createdBy = copy.createdBy || copy.userId || '';
  copy.updatedBy = copy.updatedBy || copy.userId || '';
  copy.tasks = (copy.tasks || []).map((t: any) => ({
    taskId: t.taskId,
    goalId: t.goalId,
    taskName: t.taskName,
    goalName: t.goalName,
    value: t.value,
    notes: t.notes,
    updatedAt: new Date()
  }));
  return copy;
}
