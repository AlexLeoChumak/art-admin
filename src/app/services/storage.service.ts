import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storageSub$: Subject<boolean> = new Subject<boolean>();

  constructor(private ngZone: NgZone) {
    window.addEventListener('storage', (event) => this.onStorageChange(event));
  }

  getStorage(): Observable<boolean> {
    return this.storageSub$.asObservable();
  }

  private onStorageChange(event: StorageEvent) {
    if (event.storageArea?.length === 0 || event.key === 'fb-token-exp') {
      this.ngZone.run(() => this.storageSub$.next(true));
    }
  }
}
