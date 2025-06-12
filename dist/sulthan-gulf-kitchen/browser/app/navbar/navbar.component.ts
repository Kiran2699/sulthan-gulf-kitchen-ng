import { AfterContentChecked, AfterViewChecked, Component, HostListener, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MainService } from '../services/main.service';
import { environment } from '../../environment';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  HambugerMenu!:any;
  logoUrl = environment.logoUrl;
  public _mainService = inject(MainService);
  private router = inject(Router);
  public _authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    this.onResize();
    this._authService.IsAdmin = this.router.url.includes('/admin') ? true : false;
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        document.getElementById('hamb-container')?.classList.remove('open');
        document.getElementById('side-menu-wrapper')?.classList.remove('open');
        document.getElementById('backdrop')?.classList.remove('open');
      }
    });
  }

  onMenuClick = () => {
    document.getElementById('hamb-container')?.classList.toggle('open');
    document.getElementById('side-menu-wrapper')?.classList.toggle('open');
    document.getElementById('backdrop')?.classList.toggle('open');
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 769) {
      this._mainService.IsMobile = true;
    }
    else {
      this._mainService.IsMobile = false; 
    }
  }

  onLogout() {
    this._authService.doLogout();
    if (this._authService.IsAdmin) {
      this.router.navigate(['/admin/login']);
    }
    else {
      this.router.navigate(['/login']);
    }
  }
}
