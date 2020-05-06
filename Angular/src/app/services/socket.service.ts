import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { variables } from 'src/environments/variables'
import { Observable } from 'rxjs';
import { SecureStorageService } from '../auth/secure-storage.service';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private origin: String = variables.origin
  private url = this.origin;
  private socket;
  AUTH_TOKEN = this.secureStorage.getAuthToken();
  SESSION_TOKEN = this.secureStorage.getUserId();
  constructor(private secureStorage: SecureStorageService) { 
  }
  public join(room){
    this.socket = io(this.url);
    this.socket.emit('join', { authorization_token:this.AUTH_TOKEN, room }, (error) => {
      if(error) {
        alert(error);
      }
    });
  }
  public disconnect() {
    this.socket.emit('disconnect', ({}), () => {});
  }
  public sendMessage(message) {
    this.socket.emit('sendMessage', {message, streamTime: null}, () => {});
  }
  public getMessages = () => {
    return Observable.create((observer) => {
        this.socket.on('message', (message) => {
          console.log(message)
            observer.next(message);
        });
    });
  }
  public getRoomData = () => {
    return Observable.create((observer) => {
        this.socket.on('roomData', (users) => {
            console.log(users)
            observer.next(users);
        });
    });
  }
}
