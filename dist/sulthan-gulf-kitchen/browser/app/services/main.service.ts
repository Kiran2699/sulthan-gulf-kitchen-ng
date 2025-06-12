import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Firestore, collection, addDoc, doc, collectionData, where, query, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { orderBy } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  IsMobile = false;
  SelectedItem = new BehaviorSubject<any[] | null>(null);
  IsLoading = false;
  AlertText = '';
  HideNavbar = false;
  CurrFormatedDate = new Date().toLocaleDateString('en-GB');
  private _firestore = inject(Firestore);
  private _router = inject(Router);

  constructor() {}

  async addData(collectionName: string, data: any) {
    this.IsLoading = true;
    const collectionRef = collection(this._firestore, collectionName);
    const docData =  await addDoc(collectionRef, data);
    this.IsLoading = false;
    return docData;
  }

  async updateData(collName: string, docId: string, updatedData: any) {
    this.IsLoading = true;
    const docRef = doc(this._firestore, `${collName}/${docId}`);
    const docData = await updateDoc(docRef, updatedData);
    this.IsLoading = false;
    return docData;
  }

  async deleteData(collName: string, docId: string) {
    this.IsLoading = true;
    const docRef = doc(this._firestore, `${collName}/${docId}`);
    const docData = await deleteDoc(docRef);
    this.IsLoading = false;
    return docData;
  }

  getItems(): Observable<any[]> {
    this.IsLoading = true;
    const itemsRef = collection(this._firestore, 'food-menu');
    let queryStr = query(itemsRef);
    const collData = collectionData(queryStr, { idField: 'id' });
    this.IsLoading = false;
    return collData;
  }

  getStocks(fromDte: string, toDte: string): Observable<any[]> {
    this.IsLoading = true;
    const itemsRef = collection(this._firestore, 'stocks');
    let queryStr = query(itemsRef);
    if (fromDte != '' && toDte != '') {
      queryStr = query(itemsRef, where('date', '>=', fromDte), where('date', '<=', toDte), orderBy('Document ID', 'desc'));
    }
    else if (fromDte != '' && toDte == '') {
      queryStr = query(itemsRef, where('date', '==', fromDte), orderBy('Document ID', 'desc'));
    }
    const collData = collectionData(queryStr, { idField: 'id' });
    this.IsLoading = false;
    return collData;
  }

  hideSnackBar(timems: number) {
    setTimeout(() => {
      this.AlertText = '';
    }, timems);
  }

  sortByDate(data: any, isAscending = true) {
    const formatedData = data.sort((a: any, b: any) => {
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      if (isAscending) {
        return dateA.getTime() - dateB.getTime();
      }
      else {
        return dateB.getTime() - dateA.getTime();
      }
    });
    return formatedData;
  }

  generateHours() {
    const hourArr: string[] = [];
    for (let i = 1; i < 24; i++) {
      if (i > 9) {
        hourArr.push(i.toString());
      }
      else {
        hourArr.push(`0${i.toString()}`);
      }
    }
    hourArr.push('00');
    return hourArr;
  }

  generateMinutes() {
    const minArr: string[] = [];
    for (let i = 1; i <= 60; i++) {
      if (i > 9) {
        minArr.push(i.toString());
      }
      else {
        minArr.push(`0${i.toString()}`);
      }
    }
    minArr.push('00');
    return minArr;
  }

  navigateToMenu(type: string) {
    this._router.navigate(['/menu'], {
      queryParams: {
        type: type
      }
    });
  }
}
