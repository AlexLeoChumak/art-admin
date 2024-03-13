import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, throwError } from 'rxjs';
import { Post } from 'src/app/models/post';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-all-post',
  templateUrl: './all-post.component.html',
  styleUrls: ['./all-post.component.scss'],
})
export class AllPostComponent implements OnInit, OnDestroy {
  postsArray: Post[] = [];
  loading: boolean = true;

  private lSub!: Subscription;
  private dSub!: Subscription;
  private iSub!: Subscription;
  private fSub!: Subscription;
  private mSub!: Subscription;

  constructor(
    private postsService: PostsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.lSub = this.postsService
      .loadPosts()
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (data: Post[]) => {
          data ? (this.postsArray = data) : null;
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error(err);
          this.loading = false;
        },
      });
  }

  onDelete(id: string): void {
    this.dSub = this.postsService
      .deletePost(id)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success(`Data deleted successfully`);
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  onDeleteImage(postImgUrl: string): void {
    this.iSub = this.postsService
      .deleteImageFromPost(postImgUrl)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {},
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  markFeatured(id: string, value: boolean) {
    this.mSub = this.postsService
      .markFeatured(id, value)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success(`Data update successfully`);
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.lSub) {
      this.lSub.unsubscribe();
    }
    if (this.dSub) {
      this.dSub.unsubscribe();
    }
    if (this.iSub) {
      this.iSub.unsubscribe();
    }
    if (this.fSub) {
      this.fSub.unsubscribe();
    }
    if (this.mSub) {
      this.mSub.unsubscribe();
    }
  }
}
