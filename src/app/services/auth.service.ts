import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { collection, Firestore, query, where, collectionData } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { MainService } from './main.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  CurrentLoggedInUser!: any;
  CurrentUserRole = '';
  IsAdmin = false;
  private ApiUsed = false;
  RoutesToClear = ['home', 'menu', 'contact-us'];
  private _mainService = inject(MainService);
  private _router = inject(Router);

  constructor(private _firestore: Firestore) {}

  doLogin(email: string, password: string, type: string): Observable<any[]> {
    this._mainService.IsLoading = true;
    const itemsRef = collection(this._firestore, 'users');
    let queryStr = query(itemsRef,
      where('usertype', '==', type), 
      where('email', '==', email),
      where('password', '==', password));
    const collData = collectionData(queryStr, { idField: 'id' }).pipe(
      map(users => users.map(({ orders, password, createdDate, ...rest }) => rest))
    );
    this._mainService.IsLoading = false;
    return collData;
  }
  
  doLogout() {
    this.CurrentLoggedInUser = null;
    this.CurrentUserRole = '';
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
    }
  }

  markApiUsed() {
    this.ApiUsed = true;
  }

  hasUsedApi(): boolean {
    return this.ApiUsed;
  }

  getUsers(): Observable<any[]> {
    this._mainService.IsLoading = true;
    const itemsRef = collection(this._firestore, 'users');
    const collData = collectionData(itemsRef, { idField: 'id' });
    this._mainService.IsLoading = false;
    return collData;
  }

  checkUser() {
    const token = localStorage.getItem('token');
      if (token) {
        const parsedToken = JSON.parse(token);
        if (parsedToken) {
          if (new Date() > new Date(parsedToken.tokenExpireAt)) {
            localStorage.removeItem('token')
            this.checkAndRedirect();
          }
          else {
            this.CurrentLoggedInUser = parsedToken;
            this.CurrentUserRole = parsedToken.usertype;
          }
        }
        else {
          this.checkAndRedirect();
        }
      }
      else {
        this.checkAndRedirect();
      }
  }

  redirectToLogin() {
    if (!this.IsAdmin) {
      this._router.navigate(['login']);
    }
    else {
      this._router.navigate(['admin/login']);
    }
  }

  checkAndRedirect(): void {
    const matchFound = this.RoutesToClear.some(route => this._router.url.includes(route));
    if (!matchFound) {
      this.redirectToLogin();
    }
  }
}
