import { Injectable } from '@angular/core';
import { Firestore, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { SubscriberUser } from '../models/subscriber-user';
import { HandlerDataService } from './handler-data.service';

@Injectable({
  providedIn: 'root',
})
export class SubscribersService {
  private subscribersCollection = collection(this.fs, 'subscribers');

  constructor(
    private fs: Firestore,
    private handlerDataService: HandlerDataService
  ) {}

  loadSubscribers(): Observable<SubscriberUser[]> {
    return this.handlerDataService.loadData(this.subscribersCollection);
  }

  deleteSubscriber(id: string): Observable<void | null> {
    return this.handlerDataService.deleteData(id, this.subscribersCollection);
  }
}
