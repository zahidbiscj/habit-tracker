import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, writeBatch, serverTimestamp } from '@angular/fire/firestore';
import { IGoalAssignmentService } from '../interfaces/goal-assignment.service.interface';
import { GoalAssignment, GoalAssignmentModel } from '../../models/goal-assignment.model';

@Injectable({
  providedIn: 'root'
})
export class GoalAssignmentFirebaseService implements IGoalAssignmentService {
  private collectionName = 'goalAssignments';

  constructor(private firestore: Firestore) {}

  getAssignment(goalId: string, userId: string): Observable<GoalAssignment | null> {
    const docId = `${goalId}_${userId}`;
    const docRef = doc(this.firestore, `${this.collectionName}/${docId}`);
    
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return GoalAssignmentModel.fromFirestore(docSnap.data());
        }
        return null;
      })
    );
  }

  getAssignmentsByGoalId(goalId: string): Observable<GoalAssignment[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('goalId', '==', goalId));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => GoalAssignmentModel.fromFirestore(doc.data()))
      )
    );
  }

  getAssignmentsByUserId(userId: string): Observable<GoalAssignment[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(collectionRef, where('userId', '==', userId));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => GoalAssignmentModel.fromFirestore(doc.data()))
      )
    );
  }

  getActiveAssignmentsByUserId(userId: string): Observable<GoalAssignment[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      where('active', '==', true)
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => GoalAssignmentModel.fromFirestore(doc.data()))
      )
    );
  }

  createAssignment(assignment: GoalAssignment): Observable<GoalAssignment> {
    const docId = `${assignment.goalId}_${assignment.userId}`;
    const docRef = doc(this.firestore, `${this.collectionName}/${docId}`);
    const newAssignment = new GoalAssignmentModel(assignment);
    
    return from(setDoc(docRef, {
      ...newAssignment.toFirestore(),
      createdDate: serverTimestamp(),
      updatedDate: serverTimestamp()
    })).pipe(
      map(() => newAssignment)
    );
  }

  createAssignments(assignments: GoalAssignment[]): Observable<GoalAssignment[]> {
    const batch = writeBatch(this.firestore);
    const createdAssignments: GoalAssignment[] = [];
    
    assignments.forEach(assignment => {
      const docId = `${assignment.goalId}_${assignment.userId}`;
      const docRef = doc(this.firestore, `${this.collectionName}/${docId}`);
      const newAssignment = new GoalAssignmentModel(assignment);
      
      batch.set(docRef, {
        ...newAssignment.toFirestore(),
        createdDate: serverTimestamp(),
        updatedDate: serverTimestamp()
      });
      
      createdAssignments.push(newAssignment);
    });
    
    return from(batch.commit()).pipe(
      map(() => createdAssignments)
    );
  }

  updateAssignment(assignment: GoalAssignment): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${assignment.id}`);
    const updateData: any = { ...assignment };
    delete updateData.goalId;
    delete updateData.userId;
    updateData.updatedDate = serverTimestamp();
    
    return from(updateDoc(docRef, updateData)).pipe(
      map(() => void 0)
    );
  }

  deleteAssignment(goalId: string, userId: string): Observable<void> {
    const docId = `${goalId}_${userId}`;
    const docRef = doc(this.firestore, `${this.collectionName}/${docId}`);
    return from(deleteDoc(docRef)).pipe(
      map(() => void 0)
    );
  }

  deleteAssignmentsByGoalId(goalId: string): Observable<void> {
    return this.getAssignmentsByGoalId(goalId).pipe(
      map(assignments => {
        const batch = writeBatch(this.firestore);
        assignments.forEach(assignment => {
          const docRef = doc(this.firestore, `${this.collectionName}/${assignment.id}`);
          batch.delete(docRef);
        });
        return from(batch.commit());
      }),
      map(() => void 0)
    );
  }

  assignGoalToUsers(goalId: string, userIds: string[], createdBy: string): Observable<void> {
    const assignments: GoalAssignment[] = userIds.map(userId => ({
      goalId,
      userId,
      active: true,
      createdDate: new Date(),
      updatedDate: new Date(),
      createdBy,
      updatedBy: createdBy,
      id: `${goalId}_${userId}`
    }));
    
    return this.createAssignments(assignments).pipe(
      map(() => void 0)
    );
  }

  unassignGoalFromUsers(goalId: string, userIds: string[]): Observable<void> {
    const batch = writeBatch(this.firestore);
    
    userIds.forEach(userId => {
      const docId = `${goalId}_${userId}`;
      const docRef = doc(this.firestore, `${this.collectionName}/${docId}`);
      batch.delete(docRef);
    });
    
    return from(batch.commit()).pipe(
      map(() => void 0)
    );
  }
}
