import { Component, OnInit, Input, OnDestroy, NgZone } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';

import * as io from 'socket.io-client';
import { variables } from 'src/environments/variables'
import { Observable, Subscription, Observer } from 'rxjs';
import { SecureStorageService } from 'src/app/auth/secure-storage.service';
import { ChatService } from 'src/app/services/chat.service';
import * as moment from 'moment';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit, OnDestroy {
  @Input() roomC: any;
  private observableSubscription: Subscription;
  private origin: String = variables.origin
  private url = this.origin;
  private socket;
  public message: any = {
    name: "",
    message: "",
    t: ""
  };
  private date: String = moment().format('YY-MM-DD')
  private AUTH_TOKEN = this.secureStorage.getAuthToken();
  private SESSION_TOKEN = this.secureStorage.getUserId();
  constructor(private secureStorage: SecureStorageService, private _chatService: ChatService, private zone: NgZone, public socketService: SocketService) {
  }
  // HANDLER
  onNewMessage() {
    return new Observable((observer) => {
      this.socket.on('message', msg => {
        observer.next(msg);
      });
    });
  }

  ngOnInit() {
    let room = this.roomC._id
    this._chatService.getRoomMessages(this.roomC._id).subscribe(messagesResponse => {
      if (messagesResponse.messages.length > 0) {
        this.message = messagesResponse.messages[messagesResponse.messages.length - 1]
        if (moment().format('YY-MM-DD') == moment(this.message.createdt).format('YY-MM-DD')) {
          this.message['t'] = moment(this.message.createdt).format("HH:mm")
        } else {
          this.message['t'] = moment(this.message.createdt).format("LLL")
        }
      }
    }) 
    if (this.socketService.sidebarConnects.indexOf(this.roomC._id) == -1) {
      this.socket = io(this.url, { reconnection: false });
      this.socket.emit('join', { authorization_token: this.AUTH_TOKEN, room }, (error) => {
        if (error) {
          alert(error);
        }
      });
      this.observableSubscription = this.onNewMessage().subscribe((msg: any) => {
        this.zone.run(() => { // <== added
          if (msg.i == false) {
            let message = {
              name: msg.user,
              message: msg.text,
              t: ""
            }
            if (moment().format('YY-MM-DD') == moment(msg.t).format('YY-MM-DD')) {
              message['t'] = moment(msg.t).format("HH:mm")
            } else {
              message['t'] = moment(msg.t).format("LLL")
            }
            this.message = message
          }
        });
      });
      this.socketService.sidebarConnects.push(this.roomC._id)
    }
  }

  ngOnDestroy() {
    console.log("ROOM LEFT")
    this.observableSubscription.unsubscribe(); 
    if (this.socketService.sidebarConnects.indexOf(this.roomC._id) > -1) {
      this.socketService.sidebarConnects.splice(this.socketService.sidebarConnects.indexOf(this.roomC._id), 1);
    }
    this.socket.emit('disconnect', ({}), () => { });
  }

}
