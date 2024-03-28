import { Injectable } from '@angular/core';
import {
  Observable,
  from,
  catchError,
  Subscriber,
  throwError,
  finalize,
} from 'rxjs';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  DocumentReference,
  DocumentSnapshot,
  onSnapshot,
  updateDoc,
  deleteDoc,
  FirestoreError,
} from '@angular/fire/firestore';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  categoriesCollection = collection(this.fs, 'categories');

  constructor(private fs: Firestore) {}

  loadData(): Observable<Category[]> {
    // метод загружает все посты из коллекции Firestore
    let unsubscribe: () => void;

    return new Observable((observer: Subscriber<Category[]>) => {
      unsubscribe = onSnapshot(
        this.categoriesCollection,
        (snapshot) => {
          const data = snapshot.docs.map(
            (docSnapshot: DocumentSnapshot<any>) => {
              const data = docSnapshot.data();
              const categoryId = docSnapshot.id;

              return data ? { categoryId, ...data } : null;
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

  saveData(data: Category): Observable<DocumentReference<any> | null> {
    return from(addDoc(this.categoriesCollection, data)).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data insert error. Please try again`);
      })
    );
  }

  updateData(id: string, editData: string): Observable<void | null> {
    return from(
      updateDoc(doc(this.categoriesCollection, id), { category: editData })
    ).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data update error. Please try again`);
      })
    );
  }

  deleteData(id: string): Observable<void | null> {
    return from(deleteDoc(doc(this.categoriesCollection, id))).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data delete error. Please try again`);
      })
    );
  }
}
