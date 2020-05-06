import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { SecureStorageService } from './auth/secure-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'App';
  constructor(private auth:AuthService, private secureStorage:SecureStorageService){
    this.auth.LOGGED = secureStorage.getItem('LOGGED')!=null?secureStorage.getItem('LOGGED'):false;
  }
}
