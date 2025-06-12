import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { collection, Firestore, query, where, collectionData, orderBy } from '@angular/fire/firestore';
import { MainService } from './main.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  orderStatusOption = [
    {name: 'Pending Confirmation', value: 'pen'},
    {name: 'Order Accepted', value: 'acc'},
    {name: 'Preparing your order', value: 'prep'},
    {name: 'Order is on the way', value: 'drive'},
    {name: 'Order delivered', value: 'comp'},
    {name: 'Order cancelled', value: 'cancel'}
  ];
  SelectedOrder!: any;
  private _firestore = inject(Firestore);
  private _mainService = inject(MainService);
  
  constructor() { }

  getOrders(email: string): Observable<any[]> {
    this._mainService.IsLoading = true;
    const itemsRef = collection(this._firestore, 'orders');
    let queryStr;
    let collData;
    if (email != '') {
      queryStr = query(itemsRef, where('email', '==', email));
      collData = collectionData(queryStr, { idField: 'id' });
    }
    else {
      collData = collectionData(itemsRef, { idField: 'id' });
    }
    this._mainService.IsLoading = false;
    return collData;
  }
}
