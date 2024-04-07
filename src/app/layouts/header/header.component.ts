import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, throwError } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userEmail!: string | null;

  private logoutSub!: Subscription;
  private checkAuthSub!: Subscription;
  private getStorageSub!: Subscription;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.authService
      .getUserData()
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (user) => {
          user ? (this.userEmail = user.email) : null;
        },
        error: (err) => {
          console.error(err), this.toastr.error(err);
        },
      });

    this.getStorageSub = this.storageService.getStorage().subscribe((res) => {
      res ? this.onLogout() : null;
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
          this.toastr.success('Logout successful');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.logoutSub ? this.logoutSub.unsubscribe() : null;
    this.checkAuthSub ? this.checkAuthSub.unsubscribe() : null;
    this.getStorageSub ? this.getStorageSub.unsubscribe() : null;
  }
}
