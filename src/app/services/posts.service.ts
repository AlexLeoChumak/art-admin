import { Injectable } from '@angular/core';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { from, Observable, Subscriber, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Post } from '../models/post';
import {
  DocumentData,
  DocumentSnapshot,
  Firestore,
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { DocumentReference } from 'firebase/firestore/lite';
import { Params, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  storage = getStorage();
  categoriesCollection = collection(this.fs, 'posts');

  constructor(private fs: Firestore, private router: Router) {}

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

  uploadImageAndUpdatePost(
    // метод загружает изображение в коллекцию Storage, получает его URL, и апдейтит пост, который и возвращает
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
      map(() => postData),
      catchError((err) => {
        console.error(`Error: ${err}`);
        return throwError(
          () => 'An error occurred while saving data. Please try again.'
        );
      })
    );
  }

  savePostToCollection(postData: Post): Observable<string | DocumentReference> {
    // метод сохраняет пост в коллекцию Firestore
    return from(addDoc(this.categoriesCollection, postData)).pipe(
      tap(() => this.router.navigate(['/posts'])),
      catchError((err) => {
        console.error(`Error: ${err}`);
        return throwError(
          () => 'An error occurred while saving data. Please try again.'
        );
      })
    );
  }

  loadOnePost(id: Params): Observable<DocumentData> {
    // метод получает документ из Firestore по id
    const docRef = doc(this.fs, `posts/${id}`);

    return new Observable((subscriber: Subscriber<DocumentData>) => {
      onSnapshot(docRef, (doc) => {
        subscriber.next(doc.data());
      });
    });
  }
}
