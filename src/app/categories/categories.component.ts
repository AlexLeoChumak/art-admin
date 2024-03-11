import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription, catchError, finalize, of, tap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { Category } from '../models/category';
import { CategoriesService } from '../services/categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categoryArray: Category[] = [];
  formStatus: string = 'Add';
  formCategory!: string;
  formCategoryId!: string;
  loading: boolean = true;

  public sSub!: Subscription;
  public lSub!: Subscription;
  public uSub!: Subscription;
  public dSub!: Subscription;

  constructor(
    private categoriesService: CategoriesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.lSub = this.categoriesService
      .loadData()
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (arr: Category[]) => {
          arr ? (this.categoryArray = arr) : null;
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error(err);
          this.loading = false;
        },
      });
  }

  onSubmit(formData: NgForm) {
    this.sSub = this.categoriesService
      .saveData({ ...formData.value })
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (res: any) => {
          formData.reset();

          if (res) {
            this.toastr.success('Data insert successfully');
          }
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  onEdit(category: Category): void {
    this.formStatus = 'Edit';
    this.formCategory = category.category;
    this.formCategoryId = category.id;
  }

  onUpdate(formData: NgForm): void {
    const { category } = formData.value;
    const editedData: string = category;

    this.uSub = this.categoriesService
      .updateData(this.formCategoryId, editedData)
      .subscribe({
        next: () => {
          this.toastr.success('Data update successfully');
          this.formStatus = 'Add';
          formData.resetForm();
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  onDelete(id: string): void {
    this.dSub = this.categoriesService
      .deleteData(id)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success(`Data delete successfully`);
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.sSub) {
      this.sSub.unsubscribe();
    }
    if (this.lSub) {
      this.lSub.unsubscribe();
    }
    if (this.uSub) {
      this.uSub.unsubscribe();
    }
    if (this.dSub) {
      this.dSub.unsubscribe();
    }
  }
}
