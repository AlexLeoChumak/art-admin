import { Injectable, OnInit } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Observable, Subscriber, catchError, from, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth = getAuth();
  authState$!: Observable<any>;

  constructor(private fAuth: Auth) {
    this.authState$ = new Observable((observer: Subscriber<any>) => {
      return onAuthStateChanged(this.auth, (user) => {
        if (user) {
          observer.next(user);
        } else {
          observer.next(null);
        }
      });
    });
  }

  login(email: string, password: string): Observable<any> {
    this.loadUser();
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError((err: FirebaseError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Incorrect login or password`);
      })
    );
  }

  loadUser() {
    return this.authState$;
  }
}
