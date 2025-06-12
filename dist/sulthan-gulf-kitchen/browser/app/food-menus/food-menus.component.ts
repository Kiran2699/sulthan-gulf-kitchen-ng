import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainService } from '../services/main.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-food-menus',
  imports: [CommonModule, FormsModule,  MatTabsModule, MatButtonModule, MatCardModule, MatIconModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
  templateUrl: './food-menus.component.html',
  styleUrl: './food-menus.component.scss'
})

export class FoodMenusComponent implements OnInit {
  private activatedRoute =  inject(ActivatedRoute);
  private _mainService =  inject(MainService);
  private _router =  inject(Router);
  
  MenuType = '';
  AllMenuApiRes!: any;
  SelectedItem!: any;
  SelectedSize = 'Q';
  SelectedSizeItemToDisplay!: any;
  UserCart: any[] = [];

  ArabicMenuList: any[] = [];
  disableArabicPrev = true;
  disableArabicNext = false;

  IndianMenuList: any[] = [];
  disableIndianPrev = true;
  disableIndianNext = false;

  BrMenuList: any[] = [];
  disableBrPrev = true;
  disableBrNext = false;

  CurMenuList: any[] = [];
  disableCurPrev = true;
  disableCurNext = false;

  AddMenuList: any[] = [];
  disableAddPrev = true;
  disableAddNext = false;

  constructor() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.MenuType = params['type'] && params['type'] != '' ? params['type'] : 'P';
      this.structureData();
    });
  }

  ngOnInit(): void {
    const cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
      this.UserCart = JSON.parse(cartItems);
    }
    this._mainService.getItems().subscribe(res => {
      this.AllMenuApiRes = res;
      this.structureData();
    });
  }

  structureData() {
    if (this.AllMenuApiRes) {
      const currentFeatureArr = this.AllMenuApiRes.filter((res: any) => res.type === this.MenuType);
      this.ArabicMenuList = [];
      this.IndianMenuList = [];
      this.BrMenuList = [];
      this.CurMenuList = [];
      this.AddMenuList = [];
      this.ArabicMenuList = currentFeatureArr.filter((res: any) => res.cusine === 'arabic');
      this.IndianMenuList = currentFeatureArr.filter((res: any) => res.cusine === 'indian');
      this.BrMenuList = currentFeatureArr.filter((res: any) => res.cusine === 'biriyani');
      this.CurMenuList = currentFeatureArr.filter((res: any) => res.cusine === 'curry');
      this.AddMenuList = currentFeatureArr.filter((res: any) => res.cusine === 'addons');
    }
  }

  scroll(direction: 'left' | 'right', element: HTMLDivElement, menuHeader: string) {
    const scrollAmount = element.offsetWidth * 1;
    direction === 'left' ? element.scrollBy({ left: -scrollAmount, behavior: 'smooth' }) : element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.updateButtonState(element, menuHeader), 300);
  }

  updateButtonState(el: HTMLDivElement, menuHeader: string) {
    const maxScroll = el.scrollWidth - el.clientWidth;
    const scrollLeft = el.scrollLeft;
    switch (menuHeader) {
      case 'arabic':
        this.disableArabicPrev = scrollLeft <= 0;
        this.disableArabicNext = scrollLeft >= maxScroll - 0.5;
        break;
      case 'indian':
        this.disableIndianPrev = scrollLeft <= 0;
        this.disableIndianNext = scrollLeft >= maxScroll - 0.5;
      break;
      case 'biriyani':
        this.disableBrPrev = scrollLeft <= 0;
        this.disableBrNext = scrollLeft >= maxScroll - 0.5;
      break;
      case 'curry':
        this.disableCurPrev = scrollLeft <= 0;
        this.disableCurNext = scrollLeft >= maxScroll - 0.5;
      break;
      case 'addons':
        this.disableAddPrev = scrollLeft <= 0;
        this.disableAddNext = scrollLeft >= maxScroll - 0.5;
    }
  }

  selectItem(item: any) {
    if (this.MenuType == 'R') {
      this.SelectedSizeItemToDisplay = item.sizevar[0];
      this.SelectedSizeItemToDisplay.name = item.name;
      this.SelectedItem = item;
      this.SelectedSize = item.sizevar.length === 3 ? 'Q' : 'H';
      $('#selectedItemModel').modal('show');
    }
  }

  selectSize(size: string, index: number) {
    this.SelectedSize = size;
    if (this.SelectedItem) {
      this.SelectedSizeItemToDisplay = this.SelectedItem.sizevar[index];
    }
  }

  cancelItem() {
    this.SelectedSize = 'Q';
    $('#selectedItemModel').modal('hide');
  }

  addItem() {
    const quantValue = document.getElementById('itemQuantity') as HTMLInputElement;
    this.SelectedSizeItemToDisplay.quantity = quantValue.value.toString();
    this.SelectedSizeItemToDisplay.name = this.SelectedItem.name;
    this.UserCart.push(this.SelectedSizeItemToDisplay);
    $('#selectedItemModel').modal('hide');
    quantValue.value = '1';
  }

  viewCart() {
    localStorage.setItem('cartItems', JSON.stringify(this.UserCart));
    this._router.navigate(['cart']);
  }
}
