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
  userEmail!: any;

  private logoutSub!: Subscription;
  private userEmailSub!: Subscription;
  private checkAuthSub!: Subscription;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.checkAuthSub = this.authService
      .checkAuthStatusUser()
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (value) => {
          !value ? this.onLogout() : null;
          this.userEmail = value.email;
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });

    // this.userEmailSub = this.userDataService.userData.subscribe(
    //   (data: User | null) => {
    //     this.userEmail = data ? data.email : null;
    //   }
    // );

    // this.storageService.getStorage().subscribe((res) => {
    //   res === 'user removed' ? this.onLogout() : null;
    // });
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
    if (this.logoutSub) {
      this.logoutSub.unsubscribe();
    }
    if (this.userEmailSub) {
      this.userEmailSub.unsubscribe();
    }
    if (this.checkAuthSub) {
      this.checkAuthSub.unsubscribe();
    }
  }
}
//8.59
