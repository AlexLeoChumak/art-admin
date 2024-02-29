import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  DocumentReference,
} from '@angular/fire/firestore';
import { Category } from '../models/category';
import { Observable, from, catchError, of, map } from 'rxjs';
import { DocumentSnapshot } from 'firebase/firestore/lite';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(private fs: Firestore) {}

  saveData(data: Category): Observable<DocumentReference<any> | null> {
    const collectionRef = collection(this.fs, 'categories');

    return from(addDoc(collectionRef, data)).pipe(
      catchError((error) => {
        console.error('Error saving data:', error);
        return of(null);
      })
    );
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

  // async saveData(data: Category) {
  //   try {
  //     const collectionRef = collection(this.fs, 'categories');
  //     return await addDoc(collectionRef, data);
  //   } catch (error) {
  //     console.log(error);
  //     return null;
  //   }
  // }

  // async getDocumentById(docId: string) {
  //   const docRef = doc(this.fs, 'categories', docId);
  //   const docSnap = await getDoc(docRef);

  //   if (docSnap.exists()) {
  //     return docSnap.data();
  //   } else {
  //     return null;
  //   }
  // }
}
