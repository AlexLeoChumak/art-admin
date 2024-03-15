import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.checkAuthStatusUser().pipe(
      map((authenticated: boolean) => {
        if (!authenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      })
    );
  }
}
