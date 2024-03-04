import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription, catchError, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { Category } from '../models/category';
import { CategoriesService } from '../services/categories.service';
import { DocumentData, DocumentReference } from '@angular/fire/firestore';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  sSub!: Subscription;
  lSub!: Subscription;
  uSub!: Subscription;
  dSub!: Subscription;

  categoryArray: Category[] = [];
  formStatus: string = 'Add';
  formCategory!: string;
  formCategoryId!: string;
  loading: boolean = true;

  constructor(
    private categoriesService: CategoriesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.lSub = this.categoriesService
      .loadData()
      .pipe(
        catchError((error) => {
          this.toastr.error('Data insert error');
          console.error(error);
          return of(null);
        })
      )
      .subscribe((arr) => {
        arr ? (this.categoryArray = arr) : (this.categoryArray = []);
        this.loading = false;
      });
  }

  onSubmit(formData: NgForm): void {
    this.sSub = this.categoriesService
      .saveData({ ...formData.value })
      .pipe(
        catchError((error) => {
          this.toastr.error('Data insert error');
          console.error(error);
          return of(null);
        })
      )
      .subscribe((res: DocumentReference<any, DocumentData> | null) => {
        formData.reset();

        if (!!res) {
          this.toastr.success('Data insert successfully');
        }
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
      .subscribe(() => {
        this.toastr.success('Data updated successfully');
        this.formStatus = 'Add';
        formData.resetForm();
      });
  }

  onDelete(id: string): void {
    this.dSub = this.categoriesService.deleteData(id).subscribe(() => {
      this.toastr.success('Data deleted successfully');
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
