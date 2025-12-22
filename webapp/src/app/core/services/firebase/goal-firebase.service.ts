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
    
    return from(getDocs(collectionRef)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => GoalModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  getActiveGoals(): Observable<Goal[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('active', '==', true)
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

  getGoalsForUserOnDate(goalIds: string[], selectedDate: Date): Observable<Goal[]> {
    if (goalIds.length === 0) {
      return from(Promise.resolve([]));
    }

    const collectionRef = collection(this.firestore, this.collectionName);
    const selectedTimestamp = Timestamp.fromDate(selectedDate);
    
    // Query goals where:
    // - goalId is in the list of assigned goals
    // - startDate <= selectedDate
    // - active = true
    const q = query(
      collectionRef,
      where('active', '==', true),
      where('startDate', '<=', selectedTimestamp)
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const goals = querySnapshot.docs
          .map(doc => GoalModel.fromFirestore(doc.id, doc.data()))
          .filter(goal => {
            // Filter by goalIds (assigned to user)
            if (!goalIds.includes(goal.id)) {
              return false;
            }
            
            // Check if selectedDate is within goal's date range
            // Goal started before or on selected date (already checked in query)
            // Check if goal has no end date OR end date is after or on selected date
            if (goal.endDate) {
              const endDate = new Date(goal.endDate);
              endDate.setHours(23, 59, 59, 999);
              const selected = new Date(selectedDate);
              selected.setHours(0, 0, 0, 0);
              return selected <= endDate;
            }
            
            return true; // No end date means ongoing
          });
        
        return goals;
      })
    );
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

  createGoal(goal: Goal): Observable<Goal> {
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

  updateGoal(goal: Goal): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${goal.id}`);
    const updateData: any = { ...goal };
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

  getGoalsByIds(goalIds: string[]): Observable<Goal[]> {
    if (goalIds.length === 0) {
      return from(Promise.resolve([]));
    }

    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('active', '==', true)
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        return querySnapshot.docs
          .map(doc => GoalModel.fromFirestore(doc.id, doc.data()))
          .filter(goal => goalIds.includes(goal.id));
      })
    );
  }
}
