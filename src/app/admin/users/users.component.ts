import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MainService } from '../../services/main.service';
import { environment } from '../../../environment';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  ShowAddItemBtn = true;
  IsEditMode = false;
  CustomerList: any[] = [];
  AdminList: any[] = [];
  UserTypes = [{name: 'Customer', value: 'C'}, {name: 'Admin', value: 'A'}];
  UserDetailForm!: FormGroup;
  PreviousData!: any;
  private fb = inject(FormBuilder);
  private _mainService = inject(MainService);
  private _authService = inject(AuthService);

  constructor() {}
  
  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this._authService.getUsers().subscribe({
      next: (res: any[]) => {
        this.CustomerList = res.filter((datum: any) => datum.usertype === 'C');
        this.AdminList = res.filter((datum: any) => datum.usertype === 'A');
      }, 
      error: (err) => {
        this._mainService.AlertText = `<div class="alert alert-danger" role="alert">${err.message}</div>`;
        this._mainService.hideSnackBar(5000);
      }
    });
  }

  generateForm() {
    if (this.PreviousData) {
      this.UserDetailForm = new FormGroup({
        name: new FormControl(this.PreviousData.name, Validators.required),
        email: new FormControl(this.PreviousData.email, Validators.required),
        password: new FormControl(this.PreviousData.password, Validators.required),
        phone: new FormControl(this.PreviousData.phone, Validators.required),
        usertype: new FormControl(this.PreviousData.usertype, Validators.required)
      });
    }
    else {
      this.UserDetailForm = new FormGroup({
        name: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        phone: new FormControl('', Validators.required),
        usertype: new FormControl(this.UserTypes[0].value, Validators.required)
      });
    }
  }

  onSelectUser(index: number, userType: string) {
    if (userType == 'C') {
      this.PreviousData = this.CustomerList[index];
    }
    else {
      this.PreviousData = this.AdminList[index];
    }
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
    const formValues = this.UserDetailForm.value;
    if (!this.IsEditMode) {
      this.registerUser(formValues);
    }
    else {
      this.updateUser(formValues);
    }
    this.ShowAddItemBtn = true;
    this.IsEditMode = false;
    this.PreviousData = null;
    this.getUsers();
  }

  registerUser(formValues: any) {
    formValues.orders = [];
    formValues.createdDate = this._mainService.CurrFormatedDate;
    formValues.createdBy = 'admin';
    this.UserDetailForm.reset();
    this._mainService.addData(environment.usersColl, formValues)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">User added sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not inserted.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }

  updateUser(formValues: any) {
    this._mainService.updateData(environment.usersColl, this.PreviousData.id, formValues)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">User updated sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not updated.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }

  deleteRecord() {
    this._mainService.deleteData(environment.usersColl, this.PreviousData.id)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">User deleted sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong.</div>`;
      this._mainService.hideSnackBar(5000);
    });
    this.ShowAddItemBtn = true;
    this.IsEditMode = false;
    this.PreviousData = null;
    this.getUsers();
  }
}
