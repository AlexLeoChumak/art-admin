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
        return throwError(() => err);
      })
    );
  }

  checkAuthStatusUser() {
    return new Observable((observer: Subscriber<any>) => {
      return onAuthStateChanged(this.auth, (user) => {
        try {
          const isAuthorized = user && !user.isAnonymous && user.uid !== null;

          if (isAuthorized) {
            observer.next(user);
          } else {
            observer.next(false);
          }
        } catch (err) {
          observer.error(err);
        }
      });
    });
  }

  onLogout() {
    return from(this.fAuth.signOut()).pipe(
      tap(() => localStorage.removeItem('user')),
      catchError((err) => {
        console.error(`Error: ${err}`);
        return throwError(() => err);
      })
    );
  }
}
