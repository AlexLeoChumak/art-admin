import { Injectable } from '@angular/core';
import { Observable, from, catchError, throwError } from 'rxjs';
import {
  Firestore,
  collection,
  doc,
  DocumentReference,
  updateDoc,
  FirestoreError,
} from '@angular/fire/firestore';
import { Category } from '../models/category';
import { HandlerDataService } from './handler-data.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  categoriesCollection = collection(this.fs, 'categories');

  constructor(
    private fs: Firestore,
    private handlerDataService: HandlerDataService
  ) {}

  loadCategories(): Observable<Category[]> {
    return this.handlerDataService.loadData(this.categoriesCollection);
  }

  saveCategory(
    categoriesData: Category
  ): Observable<DocumentReference<any> | null> {
    return this.handlerDataService.saveData(
      this.categoriesCollection,
      categoriesData
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

  deleteCategory(id: string): Observable<void | null> {
    return this.handlerDataService.deleteData(id, this.categoriesCollection);
  }
}
