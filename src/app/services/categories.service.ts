import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  DocumentReference,
  collectionChanges,
  docSnapshots,
  DocumentSnapshot,
  query,
  where,
  onSnapshot,
} from '@angular/fire/firestore';
import { Category, CategoryWithId } from '../models/category';
import { Observable, from, catchError, of, map, tap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(private fs: Firestore, private toastr: ToastrService) {}

  saveData(data: Category): Observable<DocumentReference<any> | null> {
    const collectionRef = collection(this.fs, 'categories');

    return from(addDoc(collectionRef, data)).pipe(
      tap(() => this.toastr.success('Data insert successfully')),
      catchError((error) => {
        console.error('Error saving data:', error);
        return of(null);
      })
    );
  }

  loadData(): Observable<any> {
    const collectionRef = collection(this.fs, 'categories');

    return new Observable((observer) => {
      const unsubscribe = onSnapshot(
        collectionRef,
        (snapshot) => {
          const data = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            const id = docSnapshot.id;
            console.log('******', data, id);

            return data ? { id, ...data } : null;
          });
          observer.next(data);
        },
        (error) => observer.error(error)
      );

      // Вернуть функцию отписки, которая будет вызвана при уничтожении Observable
      return unsubscribe;
    });
  }

  getDocumentById(docId: string): Observable<any> {
    const docRef = doc(this.fs, 'categories', docId);

    return from(getDoc(docRef)).pipe(
      map((docSnap: DocumentSnapshot<any>) => {
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          return null;
        }
      }),
      catchError((error) => {
        console.error('Error getting document:', error);
        return of(null);
      })
    );
  }
}
