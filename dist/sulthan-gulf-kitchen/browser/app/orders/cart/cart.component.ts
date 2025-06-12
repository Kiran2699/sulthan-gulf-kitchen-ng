import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MainService } from '../../services/main.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../environment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, MatRadioModule, FormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  private _authService = inject(AuthService);
  private _mainService = inject(MainService);
  private _fb = inject(FormBuilder);
  private _router = inject(Router);
  CartArr: any[] = [];
  DeliveryOptions = [{name: 'Delivery', value: 'D'}, {name: 'Pick Up', value: 'P'}];
  PaymentOptions = [{name: 'Cash On Delivery', value: 'cod'}];
  // PaymentOptions = [{name: 'Cash On Delivery', value: 'cod'}, {name: 'Card Payment', value: 'card'}];
  TotalPrice = 0;
  OrderDetailForm!: FormGroup;
  Postcodes: any[] = [];
  SelectedPostCode = '';
  DeliveryFee = environment.deliveryFee;

  constructor(){}

  ngOnInit(): void {
    this.generateForm();
    const cartItems = localStorage.getItem('cartItems');
    const center = { lat: 51.555973, lng: -0.279672 };
    this.Postcodes = environment.deliveringCity;
    if (cartItems && cartItems.length != 0) {
      this.CartArr = JSON.parse(cartItems);
      this.CartArr.forEach(element => {
        this.TotalPrice += + element.price
      });
      this.TotalPrice += + environment.deliveryFee;
    }
    else {
      this.CartArr = [];
    }
  }

  generateForm() {
    this.OrderDetailForm = this._fb.group({
      deliveryOption: new FormControl(this.DeliveryOptions[0].value, Validators.required),
      paymentOption: new FormControl(this.PaymentOptions[0].value, Validators.required),
      houseNo: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
      postcode: new FormControl('', Validators.required),
      comment: new FormControl('')
    });
  }

  removeItem(index: number) {
    this.TotalPrice -= + this.CartArr[index].price;
    this.CartArr.splice(index, 1);
  }

  onOrder() {
    const formValues = this.OrderDetailForm.value;
    const currDate = new Date();
    const hours = currDate.getHours() > 9 ? '0' + currDate.getHours().toString() : currDate.getHours().toString();
    const mins = currDate.getMinutes() > 9 ? '0' + currDate.getMinutes().toString() : currDate.getMinutes().toString();
    const formatedDate = `${currDate.toLocaleDateString('en-GB')} ${hours}:${mins}`
    if (formValues.paymentOption && formValues.paymentOption != '' && 
        formValues.deliveryOption && formValues.deliveryOption != '' && 
        formValues.houseNo && formValues.houseNo != ''&& 
        formValues.location && formValues.location != '' && 
        formValues.postcode && formValues.postcode != ''
    ) {
      const orderId = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      const orderRequest = {
        orderId: orderId,
        paymentMethod: formValues.paymentOption,
        deliveryOption: formValues.deliveryOption,
        houseNo: formValues.houseNo,
        location: formValues.location,
        postcode: formValues.postcode,
        status: 'Pending Confirmation',
        estimatedDelivery: '',
        actualDelivery: '',
        deliveredBy: '',
        comments: '',
        orderChats: [],
        orderHandledBy: '',
        totalPrice: this.TotalPrice,
        totalPricePaid: '',
        coupenUsed: '',
        orderDate: formatedDate,
        // email: 'kiranfist@gmail.com',
        // phone: '07901388979',
        email: this._authService.CurrentLoggedInUser.email,
        phone: this._authService.CurrentLoggedInUser.phone,
        name: this._authService.CurrentLoggedInUser.name,
        order: this.CartArr
      }
      const customerOrderCopy = {
        orderId: orderId,
        paymentMethod: formValues.paymentOption,
        deliveryOption: formValues.deliveryOption,
        houseNo: formValues.houseNo,
        location: formValues.location,
        postocde: formValues.postcode,
        status: 'P',
        estimatedDelivery: '',
        actualDelivery: '',
        comments: '',
        orderChats: [],
        totalPricePaid: '',
        order: this.CartArr
      }
      localStorage.removeItem('cartItems');
      this.addData(orderRequest, customerOrderCopy);
      if (this._authService.CurrentUserRole === 'C') {
        this._router.navigate(['/orders']);
      }
    }
    else {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert">All fields must be filled</div>`;
        this._mainService.hideSnackBar(5000);
    }
  }

  addData(orderVal: any, customerCopy: any) {
    this._mainService.addData(environment.ordersColl, orderVal)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">Food ordered successfully. Check Whatsapp for further updates</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not inserted.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }
}
