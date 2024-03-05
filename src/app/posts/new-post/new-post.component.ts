import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Category } from 'src/app/models/category';
import { CategoriesService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss'],
})
export class NewPostComponent implements OnInit, OnDestroy {
  permalink: string = '';
  imgSrc: any = './assets/placeholder-image.webp';
  selectedImg: any;
  lSub!: Subscription;
  categoryArray: Category[] = [];
  postForm!: FormGroup;

  constructor(
    private categoriesService: CategoriesService,
    private fb: FormBuilder
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      permalink: ['', [Validators.required]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      postImg: ['', [Validators.required]],
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

  onTitleChanged($event: any) {
    this.permalink = $event.target.value.replace(/\s/g, '-');
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
    console.log(this.postForm);
  }

  ngOnDestroy(): void {
    if (this.lSub) {
      this.lSub.unsubscribe();
      console.log('lSub отписан');
    }
  }
}
