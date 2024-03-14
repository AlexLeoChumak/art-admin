import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private data$ = new BehaviorSubject<string | null>(null);
  userEmail = this.data$.asObservable();

  changeData(data: string | null) {
    this.data$.next(data);
  }
}
