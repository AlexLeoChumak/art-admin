import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, throwError } from 'rxjs';

import { UsersService } from '../services/users.service';
import { UserReg } from '../models/user-reg';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  private loadDataSub!: Subscription;
  private deleteDataSub!: Subscription;
  users!: UserReg[];
  isLoading: boolean = true;

  constructor(
    private usersService: UsersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDataSub = this.usersService
      .loadUsers()
      .pipe(catchError((err) => throwError(() => err)))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err), (this.isLoading = false);
        },
      });
  }

  deleteData(id: string) {
    this.deleteDataSub = this.usersService
      .deleteUser(id)
      .pipe(catchError((err) => throwError(() => err)))
      .subscribe({
        next: () => this.toastr.success('User is deleted successfully'),
        error: (err) => this.toastr.error(err),
      });
  }

  ngOnDestroy(): void {
    this.loadDataSub ? this.loadDataSub.unsubscribe() : null;
    this.deleteDataSub ? this.deleteDataSub.unsubscribe() : null;
  }
}
