import { Injectable } from '@angular/core';
import { Observable, from, map, of, switchMap, catchError, throwError } from 'rxjs';
import { Auth, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
         signOut, updateEmail as firebaseUpdateEmail, updatePassword as firebaseUpdatePassword,
         reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { IAuthService } from '../interfaces/auth.service.interface';
import { User, UserModel } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthFirebaseService implements IAuthService {
  private currentUser$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    // Set up current user observable
    this.currentUser$ = new Observable(observer => {
      const unsubscribe = this.auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(this.firestore, `users/${firebaseUser.uid}`));
          if (userDoc.exists()) {
            observer.next(UserModel.fromFirestore(firebaseUser.uid, userDoc.data()));
          } else {
            observer.next(null);
          }
        } else {
          observer.next(null);
        }
      });
      return () => unsubscribe();
    });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user));
  }

  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => user?.role === 'admin'));
  }

  register(email: string, password: string, name: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => {
        const userId = userCredential.user.uid;
        const newUser = new UserModel({
          id: userId,
          name,
          email,
          role: 'user',
          active: true,
          createdDate: new Date(),
          updatedDate: new Date(),
          createdBy: userId,
          updatedBy: userId
        });

        return from(setDoc(doc(this.firestore, `users/${userId}`), {
          ...newUser.toFirestore(),
          createdDate: serverTimestamp(),
          updatedDate: serverTimestamp()
        })).pipe(
          map(() => newUser)
        );
      }),
      catchError(error => throwError(() => new Error(this.getErrorMessage(error))))
    );
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => {
        const userId = userCredential.user.uid;
        return from(getDoc(doc(this.firestore, `users/${userId}`))).pipe(
          map(userDoc => {
            if (!userDoc.exists()) {
              throw new Error('User not found');
            }
            return UserModel.fromFirestore(userId, userDoc.data());
          })
        );
      }),
      catchError(error => throwError(() => new Error(this.getErrorMessage(error))))
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      catchError(error => throwError(() => new Error('Logout failed')))
    );
  }

  updateEmail(newEmail: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return throwError(() => new Error('No user logged in'));
    }

    return from(firebaseUpdateEmail(user, newEmail)).pipe(
      switchMap(() => {
        return from(setDoc(doc(this.firestore, `users/${user.uid}`), {
          email: newEmail,
          updatedDate: serverTimestamp(),
          updatedBy: user.uid
        }, { merge: true }));
      }),
      map(() => void 0),
      catchError(error => throwError(() => new Error(this.getErrorMessage(error))))
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      return throwError(() => new Error('No user logged in'));
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    return from(reauthenticateWithCredential(user, credential)).pipe(
      switchMap(() => from(firebaseUpdatePassword(user, newPassword))),
      map(() => void 0),
      catchError(error => throwError(() => new Error(this.getErrorMessage(error))))
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email)).pipe(
      map(() => void 0),
      catchError(error => throwError(() => new Error(this.getErrorMessage(error))))
    );
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email is already in use';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/user-not-found':
        return 'User not found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/requires-recent-login':
        return 'Please log in again to perform this action';
      default:
        return error.message || 'An error occurred';
    }
  }
}
