import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { SubscribersService } from '../services/subscribers.service';
import { SubscriberUser } from '../models/subscriber-user';

@Component({
  selector: 'app-subscribers',
  templateUrl: './subscribers.component.html',
  styleUrls: ['./subscribers.component.scss'],
})
export class SubscribersComponent implements OnInit, OnDestroy {
  private loadDataSub!: Subscription;
  private deleteDataSub!: Subscription;
  subscribers!: SubscriberUser[];
  isLoading: boolean = true;

  constructor(
    private subscribersService: SubscribersService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDataSub = this.subscribersService
      .loadSubscribers()
      .pipe(catchError((err) => throwError(() => err)))
      .subscribe({
        next: (data) => {
          this.subscribers = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err), (this.isLoading = false);
        },
      });
  }

  deleteSubscribers(id: string) {
    this.deleteDataSub = this.subscribersService
      .deleteSubscriber(id)
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
