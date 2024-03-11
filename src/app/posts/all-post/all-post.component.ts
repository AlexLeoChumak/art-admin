import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, finalize, of, tap, throwError } from 'rxjs';
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

  ngOnDestroy(): void {
    if (this.lSub) {
      this.lSub.unsubscribe();
    }
    if (this.dSub) {
      this.dSub.unsubscribe();
    }
  }
}
