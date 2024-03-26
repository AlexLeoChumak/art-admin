import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubscribersService } from '../services/subscribers.service';
import { Subscription, catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SubscriberUser } from '../models/subscriberUser';

@Component({
  selector: 'app-subscribers',
  templateUrl: './subscribers.component.html',
  styleUrls: ['./subscribers.component.scss'],
})
export class SubscribersComponent implements OnInit, OnDestroy {
  private loadDataSub!: Subscription;
  private deleteDataSub!: Subscription;
  subscribers!: SubscriberUser[];
  loading: boolean = true;

  constructor(
    private subscribersService: SubscribersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDataSub = this.subscribersService
      .loadData()
      .pipe(catchError((err) => throwError(() => err)))
      .subscribe({
        next: (data) => {
          this.subscribers = data;
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error(err), (this.loading = false);
        },
      });
  }

  deleteData(id: string) {
    this.deleteDataSub = this.subscribersService
      .deleteData(id)
      .pipe(catchError((err) => throwError(() => err)))
      .subscribe({
        next: () => this.toastr.success('Subscriber is deleted successfully'),
        error: (err) => this.toastr.error(err),
      });
  }

  ngOnDestroy(): void {
    this.loadDataSub ? this.loadDataSub.unsubscribe() : null;
    this.deleteDataSub ? this.deleteDataSub.unsubscribe() : null;
  }
}
