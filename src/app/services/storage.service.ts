import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storageSub$: Subject<string> = new Subject<string>();

  constructor(private ngZone: NgZone) {
    window.addEventListener('storage', (event) => this.onStorageChange(event));
  }

  getStorage(): Observable<string> {
    return this.storageSub$.asObservable();
  }

  private onStorageChange(event: StorageEvent) {
    if (event.key === 'user' && event.newValue === null) {
      this.ngZone.run(() => this.storageSub$.next('user removed'));
    }
  }
}
