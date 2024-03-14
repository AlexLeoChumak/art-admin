import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userEmail!: string | null;

  private logoutSub!: Subscription;
  private userEmailSub!: Subscription;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private userDataService: UserDataService
  ) {}

  ngOnInit(): void {
    this.userEmailSub = this.userDataService.userEmail.subscribe((email) => {
      this.userEmail = email;
    });
  }

  onLogout() {
    this.logoutSub = this.authService
      .onLogout()
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          this.userEmail = null;
          this.toastr.success('Logout successfully');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.logoutSub) {
      this.logoutSub.unsubscribe();
    }
    if (this.userEmailSub) {
      this.userEmailSub.unsubscribe();
    }
  }
}
