import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, catchError, of } from 'rxjs';
import { Post } from 'src/app/models/post';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-all-post',
  templateUrl: './all-post.component.html',
  styleUrls: ['./all-post.component.scss'],
})
export class AllPostComponent implements OnInit, OnDestroy {
  private lSub!: Subscription;
  postsArray: Post[] = [];

  constructor(private postService: PostsService) {}

  ngOnInit(): void {
    this.lSub = this.postService
      .loadPosts()
      .pipe(
        catchError((error) => {
          console.error('Error loading data: ', error);
          return of([]);
        })
      )
      .subscribe((data: Post[]) => {
        data ? (this.postsArray = data) : null;
      });
  }

  ngOnDestroy(): void {
    if (this.lSub) {
      this.lSub.unsubscribe();
      console.log('AllPostComponent lSub отписался');
    }
  }
}
