import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription, catchError, map, of, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CategoriesService } from 'src/app/services/categories.service';
import { Category } from 'src/app/models/category';
import { Post } from 'src/app/models/post';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss'],
})
export class NewPostComponent implements OnInit, OnDestroy {
  imgSrc: string | ArrayBuffer | null | undefined =
    './assets/placeholder-image.webp';
  selectedImg: any;
  categoryArray: Category[] = [];
  postForm!: FormGroup;
  post!: any;
  formStatus: string = 'Add New';
  postId!: string;
  isLoading!: boolean;
  submitted: boolean = false;

  private lSub!: Subscription;
  private uSub!: Subscription;
  private qSub!: Subscription;
  private pSub!: Subscription;

  constructor(
    private categoriesService: CategoriesService,
    private fb: FormBuilder,
    private postsService: PostsService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      permalink: ['', [Validators.required]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      postImgUrl: ['', [Validators.required]],
      content: ['', [Validators.required]],
    });

    this.lSub = this.categoriesService
      .loadCategories()
      .pipe(
        catchError((error) => {
          console.error('Error loading data: ', error);
          return of([]);
        })
      )
      .subscribe((arr) => {
        arr ? (this.categoryArray = arr) : null;
      });

    this.qSub = this.route.queryParams
      .pipe(
        catchError((error) => {
          console.error('Error getting query parameters: ', error);
          return of({});
        })
      )
      .subscribe((params: Params) => {
        if (Object.keys(params).length === 0) {
          return;
        }

        this.postId = params['id'];

        this.pSub = this.postsService
          .loadOnePost(this.postId)
          .pipe(
            catchError((error) => {
              console.error('Error loading data: ', error);
              return of({});
            })
          )
          .subscribe({
            next: (post) => {
              this.post = post;

              if (this.post.category?.categoryId) {
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
                    `${this.post.category?.categoryId}-${this.post.category?.category}`,
                    [Validators.required],
                  ],
                  postImgUrl: ['', [Validators.required]],
                  content: [this.post.content, [Validators.required]],
                });

                this.formStatus = 'Edit';

                this.imgSrc = this.post.postImgUrl
                  ? this.post.postImgUrl
                  : './assets/placeholder-image.webp';
              } else {
                this.router.navigate(['**']);
              }
            },
            error: (err) => {
              this.toastr.error(err);
              this.router.navigate(['**']);
            },
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
    if ($event.target.files.length) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imgSrc = e.target?.result;
      };

      reader.readAsDataURL($event.target.files[0]);
      this.selectedImg = $event.target.files[0];
    } else {
      this.toastr.warning('Please select an image');
      this.imgSrc = './assets/placeholder-image.webp';
    }
  }

  onSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    this.submitted = true;
    this.isLoading = true;
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
      .uploadImageAndUpdatePost(
        this.selectedImg,
        postData,
        this.formStatus,
        this.postId
      )
      .pipe(
        catchError((error) => {
          console.error('Error insert data: ', error);
          this.toastr.error(error);
          return of({});
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Data insert successfully'),
            this.router.navigate(['/posts']);
          this.isLoading = false;
          this.submitted = false;
        },
        error: () => {
          this.toastr.error('Error insert data'), (this.submitted = false);
        },
      });
  }

  ngOnDestroy(): void {
    this.lSub ? this.lSub.unsubscribe() : null;
    this.uSub ? this.uSub.unsubscribe() : null;
    this.qSub ? this.qSub.unsubscribe() : null;
    this.pSub ? this.pSub.unsubscribe() : null;
  }
}
