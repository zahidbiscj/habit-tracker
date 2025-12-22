import { Injectable } from '@angular/core';
import { Observable, from, map, forkJoin } from 'rxjs';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
         query, where, orderBy, writeBatch, serverTimestamp } from '@angular/fire/firestore';
import { ITaskService } from '../interfaces/task.service.interface';
import { Task, TaskModel } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskFirebaseService implements ITaskService {
  private collectionName = 'tasks';

  constructor(private firestore: Firestore) {}

  getTaskById(taskId: string): Observable<Task | null> {
    const docRef = doc(this.firestore, `${this.collectionName}/${taskId}`);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return TaskModel.fromFirestore(docSnap.id, docSnap.data());
        }
        return null;
      })
    );
  }

  getTasksByGoalId(goalId: string): Observable<Task[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('goalId', '==', goalId),
      orderBy('position', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => TaskModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  getActiveTasksByGoalId(goalId: string): Observable<Task[]> {
    const collectionRef = collection(this.firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('goalId', '==', goalId),
      where('active', '==', true),
      orderBy('position', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => TaskModel.fromFirestore(doc.id, doc.data()))
      )
    );
  }

  createTask(task: Task): Observable<Task> {
    const docRef = doc(collection(this.firestore, this.collectionName));
    const taskId = docRef.id;
    const newTask = new TaskModel({ ...task, id: taskId });
    
    return from(setDoc(docRef, {
      ...newTask.toFirestore(),
      createdDate: serverTimestamp(),
      updatedDate: serverTimestamp()
    })).pipe(
      map(() => newTask)
    );
  }

  createTasks(tasks: Task[]): Observable<Task[]> {
    const batch = writeBatch(this.firestore);
    const createdTasks: Task[] = [];
    
    tasks.forEach(task => {
      const docRef = doc(collection(this.firestore, this.collectionName));
      const taskId = docRef.id;
      const newTask = new TaskModel({ ...task, id: taskId });
      
      batch.set(docRef, {
        ...newTask.toFirestore(),
        createdDate: serverTimestamp(),
        updatedDate: serverTimestamp()
      });
      
      createdTasks.push(newTask);
    });
    
    return from(batch.commit()).pipe(
      map(() => createdTasks)
    );
  }

  updateTask(task: Task): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${task.id}`);
    const updateData: any = { ...task };
    delete updateData.id;
    updateData.updatedDate = serverTimestamp();
    
    return from(updateDoc(docRef, updateData)).pipe(
      map(() => void 0)
    );
  }

  deleteTask(taskId: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${taskId}`);
    return from(deleteDoc(docRef)).pipe(
      map(() => void 0)
    );
  }

  deleteTasksByGoalId(goalId: string): Observable<void> {
    return this.getTasksByGoalId(goalId).pipe(
      map(tasks => {
        const batch = writeBatch(this.firestore);
        tasks.forEach(task => {
          const docRef = doc(this.firestore, `${this.collectionName}/${task.id}`);
          batch.delete(docRef);
        });
        return from(batch.commit());
      }),
      map(() => void 0)
    );
  }

  reorderTasks(goalId: string, taskIds: string[]): Observable<void> {
    const batch = writeBatch(this.firestore);
    
    taskIds.forEach((taskId, index) => {
      const docRef = doc(this.firestore, `${this.collectionName}/${taskId}`);
      batch.update(docRef, {
        position: index,
        updatedDate: serverTimestamp()
      });
    });
    
    return from(batch.commit()).pipe(
      map(() => void 0)
    );
  }
}
