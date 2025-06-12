import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MainService } from '../services/main.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../environment';
import { CommonModule } from '@angular/common';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  LoginSignUpForm!: FormGroup;
  logoUrl = environment.logoUrl;
  IsRegister = false;
  ClientPhone = environment.clientPhone;
  private _authService = inject(AuthService);
  private router = inject(Router);
  private _mainService = inject(MainService);
  private fb = inject(FormBuilder);
  private _auth = inject(Auth);
   
  constructor() {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this._mainService.HideNavbar = event.url.includes('/login') ? true : false;
        this.LoginSignUpForm = new FormGroup({
          name: new FormControl(''),
          phone: new FormControl(''),
          email: new FormControl('', Validators.required),
          password: new FormControl('', Validators.required)
        });
      }
    });
  }

  generateForm(type: boolean) {
    this.LoginSignUpForm.reset();
    this.IsRegister = type;
    if (this.IsRegister) {
      this.LoginSignUpForm.controls['name'].setValidators([Validators.required]);
      this.LoginSignUpForm.controls['phone'].setValidators([Validators.required]);
    }
    else {
      this.LoginSignUpForm.controls['name'].setValidators([]);
      this.LoginSignUpForm.controls['phone'].setValidators([]);
    }
  }

  doLoginSignUp() {
    const formValues = this.LoginSignUpForm.value;
    formValues.usertype = this._authService.IsAdmin ? 'A' : 'C';
    if (this.IsRegister && !this._authService.IsAdmin) {
      this.doRegister(formValues);
    }
    else {
      this._authService.doLogin(formValues.email, formValues.password, formValues.usertype).subscribe(user => {
        if (user.length > 0) {
          this._authService.CurrentLoggedInUser = user[0];
          const currDate = new Date();
          const tokenExpireAt = new Date();
          tokenExpireAt.setHours(currDate.getHours() + environment.sessionTimeout);
          this._authService.CurrentLoggedInUser.tokenExpireAt = tokenExpireAt;
          localStorage.setItem('token', JSON.stringify(this._authService.CurrentLoggedInUser));
          this._authService.CurrentUserRole = this._authService.CurrentLoggedInUser.usertype;
          if (!this._authService.IsAdmin) {
            this._mainService.navigateToMenu('R');
          }
          else {
            this.router.navigate(['admin/users']);
          }
          this.LoginSignUpForm.reset();
        }
        else {
          this._mainService.AlertText = `<div class="alert alert-danger" role="alert">User not found!</div>`;
          this._mainService.hideSnackBar(5000);
        }
      });
    }
  }

  doRegister(formValues: any) {
    formValues.orders = [];
    formValues.cart = [];
    formValues.createdDate = this._mainService.CurrFormatedDate;
    formValues.createdBy = 'customer';
    this.LoginSignUpForm.reset();
    this._mainService.addData(environment.usersColl, formValues)
    .then(docRef => this.IsRegister = false)
    .catch(err => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not inserted.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }
}
