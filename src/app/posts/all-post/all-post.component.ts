import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/models/post';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-all-post',
  templateUrl: './all-post.component.html',
  styleUrls: ['./all-post.component.scss'],
})
export class AllPostComponent implements OnInit, OnDestroy {
  lSub!: Subscription;
  postsArray: Post[] = [];

  constructor(private postService: PostsService) {}

  ngOnInit(): void {
    this.lSub = this.postService.loadPosts().subscribe((data: Post[]) => {
      console.log(data);
      this.postsArray = data;
    });
  }

  ngOnDestroy(): void {
    if (this.lSub) {
      this.lSub.unsubscribe();
      console.log('AllPostComponent lSub отписался');
    }
  }
}
