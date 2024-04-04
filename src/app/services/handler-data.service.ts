import { Injectable } from '@angular/core';
import {
  FirestoreError,
  QuerySnapshot,
  addDoc,
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

@Injectable({
  providedIn: 'root',
})
export class HandlerDataService {
  constructor() {}

  loadData(collection: any): Observable<any> {
    // метод загружает все данные из определённой коллекции Firestore
    let unsubscribe: () => void;

    return new Observable((observer: Subscriber<any>) => {
      unsubscribe = onSnapshot(
        collection,
        (snapshot: QuerySnapshot<any>) => {
          const data = snapshot.docs.map((docSnapshot) => {
            const docData = docSnapshot.data();

            if (collection.path === 'categories') {
              const categoryId = docSnapshot.id;
              return docData ? { categoryId, ...docData } : null;
            }

            const id = docSnapshot.id;
            return docData ? { id, ...docData } : null;
          });
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

  saveData(collection: any, data: any): Observable<any> {
    return from(addDoc(collection, data)).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data insert error. Please try again`);
      })
    );
  }

  deleteData(id: string, collection: any): Observable<void | null> {
    return from(deleteDoc(doc(collection, id))).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data delete error. Please try again`);
      })
    );
  }
}
