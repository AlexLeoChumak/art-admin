import { Injectable } from '@angular/core';
import { Firestore, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { HandlerDataService } from './handler-data.service';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private commentsCollection = collection(this.fs, 'comments');

  constructor(
    private fs: Firestore,
    private handlerDataService: HandlerDataService
  ) {}

  loadComments(): Observable<Comment[]> {
    return this.handlerDataService.loadData(this.commentsCollection);
  }

  deleteComment(id: string): Observable<void | null> {
    return this.handlerDataService.deleteData(id, this.commentsCollection);
  }
}
