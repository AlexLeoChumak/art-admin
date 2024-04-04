import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, throwError } from 'rxjs';
import { CommentsService } from '../services/comments.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent {
  private loadDataSub!: Subscription;
  private deleteDataSub!: Subscription;
  comments!: any;
  isLoading: boolean = true;

  constructor(
    private commentsService: CommentsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDataSub = this.commentsService
      .loadComments()
      .pipe(catchError((err) => throwError(() => err)))
      .subscribe({
        next: (data) => {
          this.comments = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err), (this.isLoading = false);
        },
      });
  }

  deleteComment(id: string) {
    this.deleteDataSub = this.commentsService
      .deleteComment(id)
      .pipe(catchError((err) => throwError(() => err)))
      .subscribe({
        next: () => this.toastr.success('Comment is deleted successfully'),
        error: (err) => this.toastr.error(err),
      });
  }

  ngOnDestroy(): void {
    this.loadDataSub ? this.loadDataSub.unsubscribe() : null;
    this.deleteDataSub ? this.deleteDataSub.unsubscribe() : null;
  }
}
