import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from '@angular/fire/firestore';
import { INotificationService } from '../interfaces/notification.service.interface';
import { Notification, NotificationModel } from '../../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationFirebaseService implements INotificationService {
  private readonly collectionName = 'notifications';

  constructor(private firestore: Firestore) {}

  getNotificationById(notificationId: string): Observable<Notification | null> {
    const docRef = doc(this.firestore, `${this.collectionName}/${notificationId}`);
    return from(getDoc(docRef)).pipe(
      map(docSnap => docSnap.exists() 
        ? NotificationModel.fromFirestore(docSnap.id, docSnap.data()) 
        : null
      )
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
    const q = query(collectionRef, where('active', '==', true));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const notifications = snapshot.docs.map(doc => 
          NotificationModel.fromFirestore(doc.id, doc.data())
        );
        return notifications.sort((a, b) => a.time.localeCompare(b.time));
      })
    );
  }

  createNotification(notification: Notification): Observable<Notification> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    const newNotification = new NotificationModel({ 
      ...notification, 
      id: docRef.id 
    });
    
    const data = {
      ...newNotification.toFirestore(),
      createdDate: serverTimestamp(),
      updatedDate: serverTimestamp()
    };
    
    return from(setDoc(docRef, data)).pipe(
      map(() => newNotification)
    );
  }

  updateNotification(notification: Notification): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${notification.id}`);
    const { id, ...updateData } = notification as any;
    
    return from(updateDoc(docRef, {
      ...updateData,
      updatedDate: serverTimestamp()
    })).pipe(
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
