import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MainService } from '../../services/main.service';
import { OrdersService } from '../../services/orders.service';
import { CommonModule } from '@angular/common';
import { OrderActionsComponent } from '../order-actions/order-actions.component';

@Component({
  selector: 'app-orders-list',
  imports: [CommonModule, OrderActionsComponent],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss'
})
export class OrdersListComponent implements OnInit {
  UserOrders: any = [];
  IsEditMode = false;
  private _authService = inject(AuthService);
  public _mainService = inject(MainService);
  private _orderService = inject(OrdersService);

  ngOnInit(): void {
    this._orderService.getOrders(this._authService.CurrentUserRole === 'C' ? this._authService.CurrentLoggedInUser.email : '').subscribe({
      next: (res: any) => {
        this.UserOrders = res;
      }, 
      error: (err) => {
        this._mainService.AlertText = `<div class="alert alert-danger" role="alert">${err.message}</div>`;
        this._mainService.hideSnackBar(5000);
      }
    });
  }

  selectOrderItem(index: number) {
    this._orderService.SelectedOrder = this.UserOrders[index];
    this.IsEditMode = true;
  }
}
