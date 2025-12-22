import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, serverTimestamp } from '@angular/fire/firestore';
import { INotificationService } from '../interfaces/notification.service.interface';
import { Notification, NotificationModel } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationFirebaseService implements INotificationService {
  private collectionName = 'notifications';

  constructor(private firestore: Firestore) {}

  getNotificationById(notificationId: string): Observable<Notification | null> {
    const docRef = doc(this.firestore, `${this.collectionName}/${notificationId}`);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return NotificationModel.fromFirestore(docSnap.id, docSnap.data());
        }
        return null;
      })
    );
  }

  getAllNotifications(): Observable<Notification[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, orderBy('time', 'asc'));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => NotificationModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  getActiveNotifications(): Observable<Notification[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('active', '==', true),
      orderBy('time', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => NotificationModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  createNotification(notification: Omit<Notification, 'id'>): Observable<Notification> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    const notificationId = docRef.id;
    const newNotification = new NotificationModel({ ...notification, id: notificationId });
    
    return from(setDoc(docRef, {
      ...newNotification.toFirestore(),
      createdDate: serverTimestamp(),
      updatedDate: serverTimestamp()
    })).pipe(
      map(() => newNotification)
    );
  }

  updateNotification(notificationId: string, updates: Partial<Notification>): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${notificationId}`);
    const updateData: any = { ...updates };
    delete updateData.id;
    updateData.updatedDate = serverTimestamp();
    
    return from(updateDoc(docRef, updateData)).pipe(
      map(() => void 0)
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${notificationId}`);
    return from(deleteDoc(docRef)).pipe(
      map(() => void 0)
    );
  }
}
