import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private lSub!: Subscription;
  private uSub!: Subscription;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.uSub = this.authService
      .loadUser()
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (user) => {
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            localStorage.clear();
          }
        },
        error: () => {
          this.toastr.error(`Authorisation Error`);
        },
      });
  }

  onSubmit(form: { email: string; password: string }) {
    this.lSub = this.authService
      .login(form.email, form.password)
      .pipe(
        catchError((err: FirebaseError) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.toastr.success(`Login successful`);
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.lSub) {
      this.lSub.unsubscribe();
    }
    if (this.uSub) {
      this.uSub.unsubscribe();
    }
  }
}
