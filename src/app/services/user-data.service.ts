// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { User } from '../models/user';

// @Injectable({
//   providedIn: 'root',
// })
// export class UserDataService {
//   private data$: BehaviorSubject<User | null> =
//     new BehaviorSubject<User | null>(null);

//   userData = this.data$.asObservable();

//   constructor() {
//     this.loadUserFromLocalStorage();
//   }

//   private loadUserFromLocalStorage() {
//     const userJson = localStorage.getItem('user');
//     userJson ? this.changeData(JSON.parse(userJson)) : null;
//   }

//   changeData(data: User | null) {
//     this.data$.next(data);
//   }
// }
