import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { MainService } from '../../services/main.service';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { environment } from '../../../environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-actions',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './order-actions.component.html',
  styleUrl: './order-actions.component.scss'
})
export class OrderActionsComponent implements OnInit {
  OrderFG!: FormGroup;
  OrderData!: any;
  deliveryFee = environment.deliveryFee;
  minArr: string[] = [];
  hourArr: string[] = [];
  public _authService = inject(AuthService);
  public _orderService = inject(OrdersService);
  private _mainService = inject(MainService);
  private _fb = inject(FormBuilder);
  @Output() IsOrderModified = new EventEmitter<void>();

  ngOnInit(): void {
    this.OrderData = this._orderService.SelectedOrder;
    const status = this._orderService.orderStatusOption.find(a => a = this.OrderData.status)?.name;
    this.minArr = this._mainService.generateMinutes();
    this.hourArr = this._mainService.generateHours();
    this.OrderFG = new FormGroup({
      comments: new FormControl(''),
      deliveredBy: new FormControl(''),
      orderHandledBy: new FormControl(''),
      actualDelMin: new FormControl(''),
      actualDelHr: new FormControl(''),
      estimatedDelHr: new FormControl(''),
      estimatedDelMin: new FormControl(''),
      status: new FormControl(status)
    });
  }

  onSubmit() {
    const formvalues = this.OrderFG.value;
    this.OrderData.comments = formvalues.comments;
    this.OrderData.deliveredBy = formvalues.deliveredBy;
    this.OrderData.orderHandledBy = formvalues.orderHandledBy;
    this.OrderData.status = formvalues.status;
    this.OrderData.estimatedDelivery = formvalues.estimatedDelHr + ':' + formvalues.estimatedDelMin;
    this.OrderData.actualDelivery = formvalues.actualDelHr + ':' + formvalues.actualDelMin;
    this.updateData(this.OrderData);
    this._orderService.SelectedOrder = null;
    this.IsOrderModified.emit();
  }

  updateData(formValues: any) {
    this._mainService.updateData(environment.ordersColl, this.OrderData.id, formValues)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">Order updated sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not updated.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }
}
