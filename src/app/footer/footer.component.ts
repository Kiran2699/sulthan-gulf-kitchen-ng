import { Component } from '@angular/core';
import { environment } from '../../environment';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  InstaUrl = environment.instaUrl;
  FbUrl = environment.fbUrl;
  WhatsAppUrl = `https://wa.me/${environment.clientPhone}`;
}
