import { Injectable } from '@angular/core';
import { variables } from 'src/environments/variables';
import { HttpClient } from '@angular/common/http';
import { SecureStorageService } from '../auth/secure-storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  origin:String = variables.origin
  AUTH_TOKEN = this.secureStorage.getAuthToken();
  LOGGED = "false";
  SESSION_TOKEN = this.secureStorage.getUserId();
  
  constructor(private http:HttpClient, private secureStorage: SecureStorageService) { }

  login(data:any):Observable<any>{
    return this.http.post(`${this.origin}/auth/admin/login-admin?`, data)
  }

  checkUser():Observable<any>{
    return this.http.get(`${this.origin}/auth/check-user?session_token=${this.SESSION_TOKEN}&authorization_token=${this.AUTH_TOKEN}`)
  }
  
}
