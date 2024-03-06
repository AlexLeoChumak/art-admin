import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

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
  imgSrc: any = './assets/placeholder-image.webp';
  selectedImg: any;
  lSub!: Subscription;
  uSub!: Subscription;
  categoryArray: Category[] = [];
  postForm!: FormGroup;

  constructor(
    private categoriesService: CategoriesService,
    private fb: FormBuilder,
    private postsService: PostsService
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
      createdAt: new Date(),
    };

    this.uSub = this.postsService
      .uploadImageAndUpdatePostAndSavePost(this.selectedImg, postData)
      .subscribe(() => {
        console.log('NewPostComponent пост загружен');
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
  }
}
