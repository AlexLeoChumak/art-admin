import { Injectable } from '@angular/core';
import {
  Observable,
  from,
  catchError,
  of,
  finalize,
  Subscriber,
  throwError,
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
} from '@angular/fire/firestore';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  categoriesCollection = collection(this.fs, 'categories');

  constructor(private fs: Firestore) {}

  loadData(): Observable<Category[]> {
    let unsubscribe: () => void;

    return new Observable((observer: Subscriber<Category[]>) => {
      unsubscribe = onSnapshot(
        this.categoriesCollection,
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
        (error) => observer.error(error)
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
      catchError((error) => {
        console.error('Error saving data:', error);
        return throwError(() => null);
      })
    );
  }

  updateData(id: string, editData: string): Observable<void | null> {
    return from(
      updateDoc(doc(this.categoriesCollection, id), { category: editData })
    ).pipe(
      catchError((error) => {
        console.error('Error updating document: ', error);
        return throwError(() => null);
      })
    );
  }

  deleteData(id: string): Observable<void | null> {
    return from(deleteDoc(doc(this.categoriesCollection, id))).pipe(
      catchError((error) => {
        console.error('Error delete document: ', error);
        return throwError(() => null);
      })
    );
  }
}
