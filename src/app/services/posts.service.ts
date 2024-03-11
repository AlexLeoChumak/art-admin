import { Injectable } from '@angular/core';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { from, Observable, Subscriber, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Post } from '../models/post';
import {
  DocumentData,
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
  updateDoc,
} from '@angular/fire/firestore';
import { DocumentReference } from 'firebase/firestore/lite';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  storage = getStorage();
  categoriesCollection = collection(this.fs, 'posts');

  constructor(private fs: Firestore) {}

  loadPosts(): Observable<Post[]> {
    // метод загружает все посты из коллекции Firestore
    let unsubscribe: () => void;

    return new Observable((observer: Subscriber<Post[]>) => {
      unsubscribe = onSnapshot(
        this.categoriesCollection,
        (snapshot) => {
          const data = snapshot.docs.map(
            (docSnapshot: DocumentSnapshot<any>) => {
              const docData = docSnapshot.data();
              const id = docSnapshot.id;

              return docData ? { id, ...docData } : null;
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
    // метод сохраняет пост в коллекцию Firestore
    return from(addDoc(this.categoriesCollection, postData)).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data insert error. Please try again`);
      })
    );
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
    return from(updateDoc(doc(this.categoriesCollection, id), editedPost)).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data update error. Please try again`);
      })
    );
  }

  deletePost(id: string) {
    // метод удаляет документ из Firestore
    return from(deleteDoc(doc(this.categoriesCollection, id))).pipe(
      catchError((err: FirestoreError) => {
        console.error(`Error: ${err}`);
        return throwError(() => `Data delete error. Please try again`);
      })
    );
  }
}
