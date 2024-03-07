import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMPTY, Subscription, catchError, switchMap } from 'rxjs';

import { CategoriesService } from 'src/app/services/categories.service';
import { Category } from 'src/app/models/category';
import { Post } from 'src/app/models/post';
import { PostsService } from 'src/app/services/posts.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss'],
})
export class NewPostComponent implements OnInit, OnDestroy {
  imgSrc: any = './assets/placeholder-image.webp';
  selectedImg: any;
  lSub!: Subscription;
  uSub!: Subscription;
  qSub!: Subscription;
  pSub!: Subscription;
  categoryArray: Category[] = [];
  postForm!: FormGroup;
  post!: any;

  constructor(
    private categoriesService: CategoriesService,
    private fb: FormBuilder,
    private postsService: PostsService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      permalink: ['', [Validators.required]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      postImgUrl: ['', [Validators.required]],
      content: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.lSub = this.categoriesService.loadData().subscribe((arr) => {
      arr ? (this.categoryArray = arr) : (this.categoryArray = []);
    });

    this.qSub = this.route.queryParams.subscribe((params: Params) => {
      if (Object.keys(params).length === 0) {
        return;
      }

      this.pSub = this.postsService
        .loadOnePost(params['id'])
        .subscribe((post) => {
          this.post = post;

          this.postForm = this.fb.group({
            title: [
              this.post.title,
              [Validators.required, Validators.minLength(5)],
            ],
            permalink: [this.post.permalink, [Validators.required]],
            excerpt: [
              this.post.excerpt,
              [Validators.required, Validators.minLength(10)],
            ],
            category: [
              `${this.post.category.categoryId}-${this.post.category.category}`,
              [Validators.required],
            ],
            postImgUrl: ['', [Validators.required]],
            content: [this.post.content, [Validators.required]],
          });

          this.imgSrc = this.post.postImgUrl;
          //7.03.55
        });
    });
  }

  get fc() {
    return this.postForm.controls;
  }

  updatePermalink($event: any) {
    const permalink = $event.target.value.replace(/\s/g, '-');
    this.postForm.patchValue({ permalink });
  }

  showPreview($event: any) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imgSrc = e.target?.result;
    };

    reader.readAsDataURL($event.target.files[0]);
    this.selectedImg = $event.target.files[0];
  }

  onSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    const splitted = this.postForm.value.category.split('-');

    const postData: Post = {
      ...this.postForm.value,
      category: {
        categoryId: splitted[0],
        category: splitted[1],
      },
      isFeatured: false,
      views: 0,
      status: 'new',
      createdAt: new Date().getTime(),
    };

    this.uSub = this.postsService
      .uploadImageAndUpdatePost(this.selectedImg, postData)
      .pipe(
        switchMap((post) => {
          return this.postsService.savePostToCollection(post);
        }),
        catchError((err) => {
          console.error(`Component error: ${err}`);
          this.toastr.error(err);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.postForm.reset();
        this.toastr.success('Data insert successfully');
        this.imgSrc = './assets/placeholder-image.webp';
      });
  }

  ngOnDestroy(): void {
    if (this.lSub) {
      this.lSub.unsubscribe();
      console.log('lSub отписан');
    }
    if (this.uSub) {
      this.uSub.unsubscribe();
      console.log('uSub отписан');
    }
    if (this.qSub) {
      this.qSub.unsubscribe();
      console.log('qSub отписан');
    }
    if (this.pSub) {
      this.pSub.unsubscribe();
      console.log('pSub отписан');
    }
  }
}
