import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
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
  constructor(private authFirebase: Auth) {}

  login(email: string, password: string): Observable<any> {
    return from(
      signInWithEmailAndPassword(this.authFirebase, email, password)
    ).pipe(
      tap((responce) => this.setToken(responce)),
      catchError((err: FirebaseError) => {
        console.error(`Error: ${err}`);
        return throwError(() => err);
      })
    );
  }

  isAuthenticated() {
    return !!this.token;
  }

  private setToken(responce: any) {
    if (responce) {
      console.log(responce);

      const expDate = new Date(
        new Date().getTime() + +responce._tokenResponse.expiresIn * 1000
      );

      console.log(expDate);

      localStorage.setItem('fb-token', responce._tokenResponse.idToken);
      localStorage.setItem('fb-token-exp', expDate.toString());
    } else {
      localStorage.clear();
    }
  }

  get token(): any {
    const tokenExpiration = localStorage.getItem('fb-token-exp');
    const expDate = tokenExpiration ? new Date(tokenExpiration) : null;

    if (!expDate || new Date() > expDate) {
      this.onLogout();
      return null;
    }

    const token = localStorage.getItem('fb-token');
    return token ? token : null;
  }

  getUserData(): Observable<any> {
    return new Observable((observer: Subscriber<any>) => {
      return this.authFirebase.onAuthStateChanged((user) => {
        try {
          if (user) {
            observer.next(user);
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
        this.setToken(null);
      }),
      catchError((err) => {
        console.error(`Error: ${err}`);
        return throwError(() => err);
      })
    );
  }
}
