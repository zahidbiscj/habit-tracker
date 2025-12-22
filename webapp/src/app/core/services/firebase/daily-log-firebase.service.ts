import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, writeBatch, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { IDailyLogService } from '../interfaces/daily-log.service.interface';
import { DailyLog, DailyLogModel } from '../../models/daily-log.model';

@Injectable({
  providedIn: 'root'
})
export class DailyLogFirebaseService implements IDailyLogService {
  private collectionName = 'dailyLogs';

  constructor(private firestore: Firestore) {}

  getLogById(logId: string): Observable<DailyLog | null> {
    const docRef = doc(this.firestore, `${this.collectionName}/${logId}`);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return DailyLogModel.fromFirestore(docSnap.id, docSnap.data());
        }
        return null;
      })
    );
  }

  getLogsByUserAndDate(userId: string, date: Date): Observable<DailyLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => DailyLogModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  getLogsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Observable<DailyLog[]> {
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
      map(querySnapshot => 
        querySnapshot.docs.map(doc => DailyLogModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  getLogByUserTaskDate(userId: string, taskId: string, date: Date): Observable<DailyLog | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      where('taskId', '==', taskId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        if (querySnapshot.empty) {
          return null;
        }
        const doc = querySnapshot.docs[0];
        return DailyLogModel.fromFirestore(doc.id, doc.data());
      })
    );
  }

  createLog(log: DailyLog): Observable<DailyLog> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    const logId = docRef.id;
    const newLog = new DailyLogModel({ ...log, id: logId });
    
    return from(setDoc(docRef, {
      ...newLog.toFirestore(),
      createdDate: serverTimestamp(),
      updatedDate: serverTimestamp()
    })).pipe(
      map(() => newLog)
    );
  }

  createLogs(logs: DailyLog[]): Observable<DailyLog[]> {
    const batch = writeBatch(this.firestore);
    const createdLogs: DailyLog[] = [];
    
    logs.forEach(log => {
      const docRef = doc(collection(this.firestore, this.collectionName));
      const logId = docRef.id;
      const newLog = new DailyLogModel({ ...log, id: logId });
      
      batch.set(docRef, {
        ...newLog.toFirestore(),
        createdDate: serverTimestamp(),
        updatedDate: serverTimestamp()
      });
      
      createdLogs.push(newLog);
    });
    
    return from(batch.commit()).pipe(
      map(() => createdLogs)
    );
  }

  updateLog(log: DailyLog): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${log.id}`);
    const updateData: any = { ...log };
    delete updateData.id;
    
    if (updateData.date) {
      updateData.date = Timestamp.fromDate(new Date(updateData.date));
    }
    
    updateData.updatedDate = serverTimestamp();
    
    return from(updateDoc(docRef, updateData)).pipe(
      map(() => void 0)
    );
  }

  upsertLog(log: DailyLog): Observable<DailyLog> {
    return this.getLogByUserTaskDate(log.userId, log.taskId, log.date).pipe(
      switchMap(existingLog => {
        if (existingLog) {
          // Update existing log
          const updatedLog = { ...existingLog, ...log, id: existingLog.id };
          return this.updateLog(updatedLog).pipe(
            map(() => updatedLog)
          );
        } else {
          // Create new log
          return this.createLog(log);
        }
      })
    );
  }

  deleteLog(logId: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${logId}`);
    return from(deleteDoc(docRef)).pipe(
      map(() => void 0)
    );
  }

  getCompletionStats(userId: string, startDate: Date, endDate: Date): Observable<{ totalTasks: number; completedTasks: number; percentage: number }> {
    return this.getLogsByUserAndDateRange(userId, startDate, endDate).pipe(
      map(logs => {
        const totalTasks = logs.length;
        const completedTasks = logs.filter(log => log.value).length;
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return {
          totalTasks,
          completedTasks,
          percentage
        };
      })
    );
  }
}
