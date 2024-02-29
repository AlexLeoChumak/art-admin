import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../models/category';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent {
  data: any;

  constructor(private categoriesService: CategoriesService) {}

  async onSubmit(formData: NgForm) {
    const categoryData: Category = { ...formData.value };

    this.categoriesService.saveData(categoryData).subscribe((res) => {
      console.log('saveDataObservable', res);
    });

    // const response = await this.categoriesService.saveData(categoryData);
    // console.log('saveData', response);
  }
}
