import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth,
  Unsubscribe,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import {
  Observable,
  Subscriber,
  Subscription,
  catchError,
  from,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  refreshTokenSub$!: Subscription;
  refreshTokenUnsubscribe!: Unsubscribe;

  constructor(private authFirebase: Auth) {}

  login(email: string, password: string): Observable<any> {
    return from(
      signInWithEmailAndPassword(this.authFirebase, email, password)
    ).pipe(
      catchError((err: FirebaseError) => {
        console.error(`Error: ${err}`);
        return throwError(() => err);
      })
    );
  }

  checkAuthStatusUser() {
    return new Observable((observer: Subscriber<any>) => {
      return this.authFirebase.onAuthStateChanged((user) => {
        try {
          const isAuthorized = user && !user.isAnonymous && user.uid !== null;

          if (isAuthorized) {
            console.log(user);

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
    return from(this.authFirebase.signOut()).pipe(
      tap(() => {
        localStorage.removeItem('user');
        if (this.refreshTokenUnsubscribe) {
          this.refreshTokenUnsubscribe();
        }
        if (this.refreshTokenSub$) {
          this.refreshTokenSub$.unsubscribe();
        }
      }),
      catchError((err) => {
        console.error(`Error: ${err}`);
        return throwError(() => err);
      })
    );
  }

  refreshToken(): void {
    this.refreshTokenUnsubscribe = this.authFirebase.onAuthStateChanged(
      (user) => {
        if (user) {
          this.refreshTokenSub$ = from(user.getIdToken(true))
            .pipe(
              switchMap((token) => {
                if (token) {
                  const user = localStorage.getItem('user')
                    ? localStorage.getItem('user')
                    : null;

                  if (user) {
                    const userObject = JSON.parse(user);
                    userObject.stsTokenManager.accessToken = token;
                    localStorage.setItem('user', JSON.stringify(userObject));
                  }
                } else {
                  this.onLogout();
                }
                return of(null);
              }),
              catchError((err) => {
                console.error(err);

                return throwError(() => err);
              })
            )
            .subscribe();
        }
      }
    );
  }
}
