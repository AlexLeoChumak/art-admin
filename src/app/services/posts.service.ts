import { Injectable } from '@angular/core';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Post } from '../models/post';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  storage = getStorage();
  categoriesCollection = collection(this.fs, 'posts');

  constructor(private fs: Firestore) {}

  uploadImageAndUpdatePostAndSavePost(
    selectedImage: any,
    postData: Post
  ): Observable<Post> {
    const filePath = `postImg/${Date.now()}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, selectedImage)).pipe(
      switchMap(() => getDownloadURL(storageRef)),
      tap((url) => {
        postData.postImgUrl = url;
      }),
      switchMap(() => from(addDoc(this.categoriesCollection, postData))),
      catchError((error) => {
        console.error('Error saving data:', error);
        return throwError(() => null);
      }),
      map(() => postData)
    );
  }
}
