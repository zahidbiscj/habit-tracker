import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { IUserService } from '../interfaces/user.service.interface';
import { User, UserModel } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserFirebaseService implements IUserService {
  private collectionName = 'users';

  constructor(private firestore: Firestore) {}

  getUserById(userId: string): Observable<User | null> {
    const docRef = doc(this.firestore, `${this.collectionName}/${userId}`);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return UserModel.fromFirestore(docSnap.id, docSnap.data());
        }
        return null;
      })
    );
  }

  getAllUsers(): Observable<User[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    return from(getDocs(collectionRef)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => UserModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  getUsersByRole(role: 'admin' | 'user'): Observable<User[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('role', '==', role));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => UserModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    const userId = docRef.id;
    const newUser = new UserModel({ ...user, id: userId });
    
    return from(setDoc(docRef, {
      ...newUser.toFirestore(),
      createdDate: serverTimestamp(),
      updatedDate: serverTimestamp()
    })).pipe(
      map(() => newUser)
    );
  }

  updateUser(userId: string, updates: Partial<User>): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${userId}`);
    const updateData: any = { ...updates };
    delete updateData.id;
    updateData.updatedDate = serverTimestamp();
    
    return from(updateDoc(docRef, updateData)).pipe(
      map(() => void 0)
    );
  }

  deleteUser(userId: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${userId}`);
    return from(deleteDoc(docRef)).pipe(
      map(() => void 0)
    );
  }

  updateFcmToken(userId: string, fcmToken: string | null): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${userId}`);
    return from(updateDoc(docRef, { 
      fcmToken,
      updatedDate: serverTimestamp()
    })).pipe(
      map(() => void 0)
    );
  }
}
