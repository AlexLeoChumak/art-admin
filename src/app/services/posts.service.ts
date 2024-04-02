import { Injectable } from '@angular/core';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { forkJoin, from, Observable, Subscriber, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  FirestoreError,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Post } from '../models/post';
import { HandlerDataService } from './handler-data.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  storage = getStorage();
  postCollection = collection(this.fs, 'posts');

  constructor(
    private fs: Firestore,
    private handlerDataService: HandlerDataService
  ) {}

  loadPosts(): Observable<Post[]> {
    return this.handlerDataService.loadData(this.postCollection);
  }

  uploadImageAndUpdatePost(
    // метод загружает изображение в коллекцию Storage, получает его URL, и апдейтит пост, который и возвращает
    selectedImage: Blob | Uint8Array | ArrayBuffer,
    postData: Post,
    formStatus: string,
    id: string
  ): Observable<Post> {
    const filePath = `postImg/${Date.now()}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, selectedImage)).pipe(
      switchMap(() => getDownloadURL(storageRef)),
      switchMap((url) => {
        postData.postImgUrl = url;

        if (formStatus === 'Edit') {
          return this.updatePostToCollection(id, postData);
        } else {
          return this.savePostToCollection(postData);
        }
      }),
      map(() => postData),
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data insert error. Please try again`);
      })
    );
  }

  savePostToCollection(postData: Post): Observable<string | DocumentReference> {
    return this.handlerDataService.saveData(this.postCollection, postData);
  }

  loadOnePost(id: string): Observable<DocumentData> {
    // метод получает документ из Firestore по id

    return from(getDoc(doc(this.fs, `posts/${id}`))).pipe(
      map((docSnapshot) => {
        const data = docSnapshot.data();

        if (!data) {
          return throwError(() => `No data`);
        }
        return data;
      }),
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data getting error. Please try again`);
      })
    );
  }

  updatePostToCollection(id: string, editedPost: any) {
    // метод обновляет документ в Firestore
    return from(updateDoc(doc(this.postCollection, id), editedPost)).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data update error. Please try again`);
      })
    );
  }

  markFeatured(id: string, featuredData: boolean) {
    // метод обновляет значение поля isFeatured в документе в Firestore
    return from(
      updateDoc(doc(this.postCollection, id), {
        isFeatured: featuredData,
      })
    ).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data update error. Please try again`);
      })
    );
  }

  deletePost(id: string): Observable<void[]> {
    // Удаляем документ из Firestore
    return from(deleteDoc(doc(this.postCollection, id))).pipe(
      switchMap(() => {
        // Создаем запрос для комментариев с фильтром по postId
        const commentsQuery = query(
          collection(this.fs, 'comments'),
          where('postId', '==', id)
        );

        // Получаем комментарии по запросу
        return from(getDocs(commentsQuery)).pipe(
          switchMap((querySnapshot) => {
            // Удаляем каждый комментарий
            const deleteObservables: Observable<void>[] = [];
            querySnapshot.forEach((doc) => {
              deleteObservables.push(from(deleteDoc(doc.ref)));
            });
            return forkJoin(deleteObservables);
          })
        );
      }),
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        throw new Error('Data delete error. Please try again');
      })
    );
  }

  deleteImageFromPost(postImgPath: string) {
    // метод удаляет изображение из Storage
    return from(deleteObject(ref(this.storage, postImgPath))).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Image delete error. Please try again`);
      })
    );
  }
}
