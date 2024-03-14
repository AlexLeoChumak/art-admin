import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import {
  Observable,
  Subscriber,
  catchError,
  from,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth = getAuth();

  constructor(private fAuth: Auth) {}

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.fAuth, email, password)).pipe(
      catchError((err: FirebaseError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Login error`);
      })
    );
  }

  checkAuthStatusUser() {
    return new Observable((observer: Subscriber<any>) => {
      return onAuthStateChanged(this.auth, (user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          observer.next(user);
        } else {
          localStorage.removeItem('user');
          observer.next(null);
        }
      });
    });
  }

  onLogout() {
    return from(this.fAuth.signOut()).pipe(
      tap(() => localStorage.removeItem('user')),
      catchError((err) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Account logout error`);
      })
    );
  }
}
