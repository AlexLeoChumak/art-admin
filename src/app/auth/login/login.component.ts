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
  private loginSub$!: Subscription;
  isLoggedInGuard: boolean = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit(form: { email: string; password: string }) {
    this.loginSub$ = this.authService
      .login(form.email, form.password)
      .pipe(
        catchError((err: FirebaseError) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (res) => {
          const user = res.user;

          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }

          this.isLoggedInGuard = true;
          this.toastr.success(`Login successful`);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.loginSub$) {
      this.loginSub$.unsubscribe();
    }
  }
}
