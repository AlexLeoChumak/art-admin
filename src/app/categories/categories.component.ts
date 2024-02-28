import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  Firestore,
  collectionData,
  collection,
  addDoc,
  DocumentReference,
  doc,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { DocumentData } from 'firebase/firestore/lite';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent {
  constructor(private fs: Firestore) {}

  async onSubmit(
    formData: NgForm
  ): Promise<DocumentReference<any, DocumentData> | undefined> {
    const categoryData = { ...formData.value };

    try {
      const collectionRef = collection(this.fs, 'categories');
      return await addDoc(collectionRef, categoryData);

      // const resID = doc(this.fs, 'categories', res1.id);
      // console.log('resID', resID);

      // const categCollection = collection(this.fs, 'categories');
      // collectionData(categCollection).subscribe((items) => {
      //   console.log('items', items);
      // });
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}
