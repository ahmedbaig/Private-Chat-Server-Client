import { Injectable } from '@angular/core';
import { variables } from 'src/environments/variables'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SecureStorageService } from '../auth/secure-storage.service';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  origin:String = variables.origin
  AUTH_TOKEN = this.secureStorage.getAuthToken();
  SESSION_TOKEN = this.secureStorage.getUserId();
  
  constructor(private http:HttpClient, private secureStorage: SecureStorageService) { }

  getRooms():Observable<any>{
    return this.http.get(`${this.origin}/api/rooms/get-rooms?session_token=${this.SESSION_TOKEN}&authorization_token=${this.AUTH_TOKEN}`)
  }

  getRoom():Observable<any>{
    return this.http.get(`${this.origin}/api/rooms/get-room?session_token=${this.SESSION_TOKEN}&authorization_token=${this.AUTH_TOKEN}`)
  }

  getRoomMessages(room:String):Observable<any>{
    return this.http.get(`${this.origin}/api/messages/livechat-messages?room=${room}&session_token=${this.SESSION_TOKEN}&authorization_token=${this.AUTH_TOKEN}`)
  }

  deleteRoomMessage(body:any):Observable<any>{
    return this.http.post(`${this.origin}/api/messages/livechat-delete-message?session_token=${this.SESSION_TOKEN}&authorization_token=${this.AUTH_TOKEN}`, body)
  }
}
