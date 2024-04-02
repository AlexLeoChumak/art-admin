import { Injectable } from '@angular/core';
import { collection, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserReg } from '../models/user-reg';
import { HandlerDataService } from './handler-data.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private usersCollection = collection(this.fs, 'users');

  constructor(
    private fs: Firestore,
    private handlerDataService: HandlerDataService
  ) {}

  loadUsers(): Observable<UserReg[]> {
    return this.handlerDataService.loadData(this.usersCollection);
  }

  deleteUser(id: string): Observable<void | null> {
    return this.handlerDataService.deleteData(id, this.usersCollection);
  }
}
