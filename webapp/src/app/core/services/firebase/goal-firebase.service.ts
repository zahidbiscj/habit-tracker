import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { IGoalService } from '../interfaces/goal.service.interface';
import { Goal, GoalModel } from '../../models/goal.model';

@Injectable({
  providedIn: 'root'
})
export class GoalFirebaseService implements IGoalService {
  private collectionName = 'goals';

  constructor(private firestore: Firestore) {}

  getGoalById(goalId: string): Observable<Goal | null> {
    const docRef = doc(this.firestore, `${this.collectionName}/${goalId}`);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return GoalModel.fromFirestore(docSnap.id, docSnap.data());
        }
        return null;
      })
    );
  }

  getAllGoals(): Observable<Goal[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, orderBy('startDate', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => GoalModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  getActiveGoals(): Observable<Goal[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('active', '==', true),
      orderBy('startDate', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => GoalModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  getGoalsForUser(userId: string): Observable<Goal[]> {
    // This requires querying GoalAssignments and then fetching goals
    // For simplicity, we'll fetch all active goals and filter on client side
    // In production, consider using a composite query or denormalization
    return this.getActiveGoals();
  }

  getGoalsByDateRange(startDate: Date, endDate: Date): Observable<Goal[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('startDate', '<=', Timestamp.fromDate(endDate)),
      where('active', '==', true)
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const goals = querySnapshot.docs.map(doc => GoalModel.fromFirestore(doc.id, doc.data()));
        // Filter on client side for endDate or null check
        return goals.filter(goal => 
          !goal.endDate || goal.endDate >= startDate
        );
      })
    );
  }

  createGoal(goal: Omit<Goal, 'id'>): Observable<Goal> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    const goalId = docRef.id;
    const newGoal = new GoalModel({ ...goal, id: goalId });
    
    return from(setDoc(docRef, {
      ...newGoal.toFirestore(),
      createdDate: serverTimestamp(),
      updatedDate: serverTimestamp()
    })).pipe(
      map(() => newGoal)
    );
  }

  updateGoal(goalId: string, updates: Partial<Goal>): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${goalId}`);
    const updateData: any = { ...updates };
    delete updateData.id;
    
    // Convert dates to Timestamps
    if (updateData.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(updateData.startDate));
    }
    if (updateData.endDate) {
      updateData.endDate = Timestamp.fromDate(new Date(updateData.endDate));
    }
    
    updateData.updatedDate = serverTimestamp();
    
    return from(updateDoc(docRef, updateData)).pipe(
      map(() => void 0)
    );
  }

  deleteGoal(goalId: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${goalId}`);
    return from(deleteDoc(docRef)).pipe(
      map(() => void 0)
    );
  }
}
