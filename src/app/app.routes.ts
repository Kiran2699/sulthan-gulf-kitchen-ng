import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FoodMenusComponent } from './food-menus/food-menus.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AdminFoodMenuComponent } from './admin/admin-food-menu/admin-food-menu.component';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from './guards/admin.guard';
import { AdminStocksComponent } from './admin/admin-stocks/admin-stocks.component';
import { UsersComponent } from './admin/users/users.component';
import { OrdersListComponent } from './orders/orders-list/orders-list.component';
import { CartComponent } from './orders/cart/cart.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: 'login', component: LoginComponent },
    { path: 'home', component: LandingPageComponent },
    { path: 'menu', component: FoodMenusComponent },
    { path: 'orders', component: OrdersListComponent, canActivate: [AuthGuard] },
    { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
    { path: 'contact-us', component: ContactUsComponent },
    { path: 'admin/login', component: LoginComponent },
    { path: 'admin/food-menu', component: AdminFoodMenuComponent, canActivate: [AdminGuard] },
    { path: 'admin/users', component: UsersComponent, canActivate: [AdminGuard] },
    { path: 'admin/orders', component: OrdersListComponent, canActivate: [AdminGuard] },
    { path: 'admin/stocks', component: AdminStocksComponent, canActivate: [AdminGuard] },
    { path: '**', redirectTo: '/home', pathMatch: 'full' }
];