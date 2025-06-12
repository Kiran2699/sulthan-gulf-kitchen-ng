import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MainService } from '../../services/main.service';
import { environment } from '../../../environment';

@Component({
  selector: 'app-admin-stocks',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-stocks.component.html',
  styleUrl: './admin-stocks.component.scss'
})
export class AdminStocksComponent implements OnInit {
  private fb = inject(FormBuilder);
  private _mainService = inject(MainService);
  ShowAddItemBtn = true;
  IsEditMode = false;
  StocksList: any[] = [];
  StocksListToDisplay: any[] = [];
  StockDetailForm!: FormGroup;
  PreviousData!: any;
  PaidByOpt = ['owner', 'employee'];
  RefundStat = ['not applicable', 'received refund', 'waiting for refund'];
  checkRefundText = 'waiting for refund';

  constructor() {}

  ngOnInit(): void {
    this.getStocks('', '');
  }

  generateForm() {
    if (this.PreviousData) {
      this.StockDetailForm = new FormGroup({
        date: new FormControl(this.PreviousData.date, Validators.required),
        stocks: this.fb.array([])
      });
      this.PreviousData.stocks.forEach((datum: any) => {
        this.addItem(datum.name, datum.quantity, datum.price, datum.paidby, datum.purchaseby, datum.refundstat)
      });
    }
    else {
      this.StockDetailForm = new FormGroup({
        date: new FormControl(this._mainService.CurrFormatedDate, Validators.required),
        stocks: this.fb.array([this.createItem('', '1', '', this.PaidByOpt[0], '', this.RefundStat[0])])
      });
    }
  }

  getStocks(fromDte: string, toDte: string) {
    this._mainService.getStocks(fromDte, toDte).subscribe({
      next: (res: any[]) => {
        const formatedList = this._mainService.sortByDate(res, false);
        formatedList.forEach((datum: any) => {
          this.constructTableElements(datum);
        });
        this.StocksList = res;
      }, 
      error: (err) => {
        this._mainService.AlertText = `<div class="alert alert-danger" role="alert">${err.message}</div>`;
        this._mainService.hideSnackBar(5000);
      }
    });
  }

  constructTableElements(datum: any) {
    let totalPrice = 0;
    let paymentDue = 0;
    datum.stocks.forEach((stock: any) => {
      totalPrice += parseFloat(stock.price);
      if (stock.refundstat == this.checkRefundText) {
        paymentDue += parseFloat(stock.price);
      }
    });
    this.StocksListToDisplay.push({
      date: datum.date,
      totalPrice: totalPrice,
      totalItems: datum.stocks.length,
      paymentDue: paymentDue
    });
  }

  createItem = (name: string, quantity: string, price: string, paidby: string, purchaseby: string, refundstat: string)  => this.fb.group({ name: name, quantity: quantity, price: price, paidby: paidby, purchaseby: purchaseby, refundstat: refundstat}, Validators.requiredTrue);

  get items(): FormArray {  
    return this.StockDetailForm.get('stocks') as FormArray;
  }

  addItem = (name: string, quantity: string, price: string, paidby: string, purchaseby: string, refundstat: string) => this.items.push(this.createItem(name, quantity, price, paidby, purchaseby, refundstat))

  removeItem = (index: number) => this.items.removeAt(index)

  selectStockItem(index: number) {
    this.PreviousData = this.StocksList[index];
    this.ShowAddItemBtn = false;
    this.IsEditMode = true;
    this.generateForm();
  }

  onAddItem() {
    this.PreviousData = null;
    this.ShowAddItemBtn = false;
    this.IsEditMode = false;
    this.generateForm();
  }

  onSubmit() {
    const formValues = this.StockDetailForm.value;
    if (!this.IsEditMode) {
      this.addData(formValues);
    }
    else {
      this.updateData(formValues);
    }
    this.ShowAddItemBtn = true;
    this.IsEditMode = false;
    this.PreviousData = null;
  }

  addData(formValues: any) {
    this._mainService.addData(environment.stocksColl, formValues)
    .then(docRef => {
      this.constructTableElements(formValues);
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">Stock's added sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not inserted.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }

  updateData(formValues: any) {
    this._mainService.updateData(environment.stocksColl, this.PreviousData.id, formValues)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">Stock's updated sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not updated.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }

  deleteRecord() {
    this._mainService.deleteData(environment.stocksColl, this.PreviousData.id)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">Stock deleted sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong.</div>`;
      this._mainService.hideSnackBar(5000);
    });
    this.ShowAddItemBtn = true;
    this.IsEditMode = false;
    this.PreviousData = null;
  }
}
