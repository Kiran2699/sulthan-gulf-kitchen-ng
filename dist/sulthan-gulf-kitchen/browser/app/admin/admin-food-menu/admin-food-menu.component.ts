import { Component, inject } from '@angular/core';
import { AdminMenuActionsComponent } from '../admin-menu-actions/admin-menu-actions.component';
import { MainService } from '../../services/main.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-food-menu',
  imports: [AdminMenuActionsComponent, MatTabsModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './admin-food-menu.component.html',
  styleUrl: './admin-food-menu.component.scss'
})
export class AdminFoodMenuComponent {
  ShowAddItemBtn = true;
  IsEditMode = false;
  PartyMenuItems!: any[];
  RetailMenuItems!: any[];
  PreviousData!: any[];
  private _mainService = inject(MainService);

  constructor(){
    this.getData();
  }

  getData() {
    this._mainService.getItems().subscribe((res: any[]) => {
      if (res) {
        this.PartyMenuItems = res.filter((datum) => datum.type === "P");
        this.RetailMenuItems = res.filter((datum) => datum.type === "R");
      }
    });
  }

  selectMenuItem(item: any, index: number) {
    this.PreviousData = item;
    this.ShowAddItemBtn = false;
    this.IsEditMode = true;
  }

}