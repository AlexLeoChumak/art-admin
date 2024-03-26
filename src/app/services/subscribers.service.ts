import { Injectable } from '@angular/core';
import {
  DocumentSnapshot,
  Firestore,
  FirestoreError,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from '@angular/fire/firestore';
import {
  Observable,
  Subscriber,
  catchError,
  finalize,
  from,
  throwError,
} from 'rxjs';
import { SubscriberUser } from '../models/subscriberUser';

@Injectable({
  providedIn: 'root',
})
export class SubscribersService {
  private subscribersCollection = collection(this.fs, 'subscribers');

  constructor(private fs: Firestore) {}

  loadData(): Observable<SubscriberUser[]> {
    // метод загружает всех подписчиков из коллекции Firestore
    let unsubscribe: () => void;

    return new Observable((observer: Subscriber<SubscriberUser[]>) => {
      unsubscribe = onSnapshot(
        this.subscribersCollection,
        (snapshot) => {
          const data = snapshot.docs.map(
            (docSnapshot: DocumentSnapshot<any>) => {
              const data = docSnapshot.data();
              const id = docSnapshot.id;

              return data ? { id, ...data } : null;
            }
          );
          observer.next(data);
        },
        (err: FirestoreError) => {
          console.error(`Error: ${err}`);
          observer.error(
            `An error occurred while loading data. Please try again`
          );
        }
      );
    }).pipe(
      finalize(() => {
        if (unsubscribe) {
          unsubscribe();
        }
      })
    );
  }

  deleteData(id: string): Observable<void | null> {
    return from(deleteDoc(doc(this.subscribersCollection, id))).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data delete error. Please try again`);
      })
    );
  }
}
