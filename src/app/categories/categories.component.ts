import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CategoriesService } from '../services/categories.service';
import { Category, CategoryWithId } from '../models/category';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  sSub!: Subscription;
  lSub!: Subscription;
  categoryArray!: any;

  constructor(
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lSub = this.categoriesService.loadData().subscribe((arr) => {
      this.categoryArray = arr;
      this.cdr.detectChanges();
    });
  }

  onSubmit(formData: NgForm): void {
    const categoryData: Category = { ...formData.value };
    this.unSubscribe();

    this.sSub = this.categoriesService
      .saveData(categoryData)
      .subscribe((res) => {
        console.log('CategoriesComponent onSubmit(formData: NgForm)', res);
      });
  }

  unSubscribe(): void {
    if (this.sSub) {
      this.sSub.unsubscribe();
    }
    if (this.lSub) {
      this.lSub.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unSubscribe();
  }
}
