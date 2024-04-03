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
  private loginSub!: Subscription;
  isLoggedInGuard: boolean = false;
  isLoading!: boolean;
  isVisibilityPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit(form: { email: string; password: string }) {
    this.isLoading = true;

    this.loginSub = this.authService
      .login(form.email, form.password)
      .pipe(
        catchError((err: FirebaseError) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success(`Login successful`);
          this.isLoggedInGuard = true;
          this.router.navigate(['/']);
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err);
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.loginSub ? this.loginSub.unsubscribe() : null;
  }
}
