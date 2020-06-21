import * as moment from 'moment';
import * as _ from 'lodash';
import * as io from 'socket.io-client';
import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

import { SecureStorageService } from 'src/app/auth/secure-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { SocketService } from 'src/app/services/socket.service';
import { variables } from 'src/environments/variables'

declare var $:any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  public session: any = {}

  private origin: String = variables.origin
  private url = this.origin;
  private socket;
  AUTH_TOKEN = this.secureStorage.getAuthToken();
  SESSION_TOKEN = this.secureStorage.getUserId();

  rooms: any = [];
  active: String = null
  activeChat: any = {}

  message: string = "";
  userImage: string = "";
  userImageDisplay: string = "";
  userName: string = "";
  messages: any[] = [];
  users: string[] = [];
  constructor(private auth: AuthService, private chatService: ChatService, private secureStorage: SecureStorageService, private router: Router, private zone: NgZone) { }
  join(room) {
    this.socket.emit('join', { authorization_token: this.AUTH_TOKEN, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }
  getMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('message', (message) => {
        observer.next(message);
      });
    });
  }
  getRoomData = () => {
    return Observable.create((observer) => {
      this.socket.on('roomData', (users) => {
        observer.next(users);
      });
    });
  }
  disconnect = () => {
    this.socket.emit('disconnect', ({}));
  }

  ngOnInit() {
    let logged = this.auth.LOGGED
    if (logged == 'false' || logged == null) {
      this.router.navigate([''])
      localStorage.clear();
    } else {
      this.auth.AUTH_TOKEN = this.secureStorage.getAuthToken();
      this.auth.SESSION_TOKEN = this.secureStorage.getUserId();
      let loginDate = this.secureStorage.getItem('loginDate');
      let current = moment().startOf('day');
      let DayPassed = moment.duration(current.diff(loginDate)).asDays();
      if (DayPassed < 5) {
        this.auth.checkUser().subscribe(res => {
          this.session = res.session
          this.userImage = res.session.meta.split("|")[0]
          this.userImageDisplay = res.session.meta.split("|")[0]
          this.userName = res.session.name
        })

        this.socket = io(this.url);
        this.fetchData();
        this.getMessages()
          .subscribe((message: any) => {
            this.zone.run(() => { // <== added
              if (message.i == false) {
                let body = {
                  createdt: message.t,
                  message: message.text,
                  name: message.user,
                  meta: message.userData.meta,
                  info: false,
                  profilePicture: message.userData.meta.split('|')[0],
                  role: message.userData.meta.split('|')[1],
                  id: message.userData._id,
                }
                if (moment().format('YY-MM-DD') == moment(body.createdt).format('YY-MM-DD')) {
                  body['createdt'] = moment(body.createdt).format("HH:mm")
                } else {
                  body['createdt'] = moment(body.createdt).format("LLL")
                }
                this.messages.push(body);
                setTimeout(()=>{
                  $("#scrollMe").mCustomScrollbar("scrollTo","bottom");
                }, 100)
              }else if(message.i == true){
                let body = {
                  createdt: message.t,
                  message: message.text,
                  name: message.user,
                  id: message.id,
                  info: true
                }
                if (moment().format('YY-MM-DD') == moment(body.createdt).format('YY-MM-DD')) {
                  body['createdt'] = moment(body.createdt).format("HH:mm")
                } else {
                  body['createdt'] = moment(body.createdt).format("LLL")
                }
                this.messages.push(body);
                setTimeout(()=>{
                  $("#scrollMe").mCustomScrollbar("scrollTo","bottom");
                }, 100)
              }
            })
          });
        this.getRoomData()
          .subscribe((users: any) => {
            this.zone.run(() => { // <== added
              this.users = users.users;
              console.log(this.users)
            })
          });
      }
      else {
        localStorage.clear();
        this.router.navigate(['']);
      }
    }
  }
  ngOnDestroy() {
    this.socket.emit('disconnect', ({}));
  }

  fetchData() {
    this.chatService.getRooms().subscribe(res => {
      this.rooms = res.rooms
      this.rooms.forEach(room => {
        room.meta = room.meta.split('|')
      });
      this.active = this.rooms[0]._id;
      this.activeChat = this.rooms[0]
      this.chatService.getRoomMessages(this.active).subscribe(res => {
        res.messages.forEach(message => {
          let body = {
            createdt: message.createdt,
            message: message.message,
            name: message.name,
            meta: message.meta,
            profilePicture: message.meta.split('|')[0],
            role: message.meta.split('|')[1],
            id: message.from,
            info: false
          }
          if (moment().format('YY-MM-DD') == moment(body.createdt).format('YY-MM-DD')) {
            body['createdt'] = moment(body.createdt).format("HH:mm")
          } else {
            body['createdt'] = moment(body.createdt).format("LLL")
          }
          this.messages.push(body)
          setTimeout(()=>{
            $("#scrollMe").mCustomScrollbar("scrollTo","bottom");
          }, 2000)
        })
      })

      let room = this.rooms[0]._id;
      this.socket.emit('join', { authorization_token: this.AUTH_TOKEN, room }, (error) => {
        if (error) {
          alert(error);
        }
      });
      this.socket.emit('sendMessage', { message: this.socket.id, streamTime: null });
    })
  }

  sendMessage() {
    if (this.message == "") {
      Swal.fire("Opps..", "Blank Message", "error")
    }
    this.socket.emit('sendMessage', { message: this.message, streamTime: null });
    this.message = '';
  }

  changeRoom(id) {
    this.active = id
    this.activeChat = _.find(this.rooms, room => { return room._id == id })

    let room = id
    this.socket.emit('join', { authorization_token: this.AUTH_TOKEN, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
    this.socket.emit('sendMessage', { message: this.socket.id, streamTime: null });
    this.messages = [];
    this.chatService.getRoomMessages(this.active).subscribe(res => {
      res.messages.forEach(message => {
        let body = {
          createdt: message.createdt,
          message: message.message,
          name: message.name,
          meta: message.meta,
          profilePicture: message.meta.split('|')[0],
          role: message.meta.split('|')[1],
          id: message.from,
          info: false
        }
        if (moment().format('YY-MM-DD') == moment(body.createdt).format('YY-MM-DD')) {
          body['createdt'] = moment(body.createdt).format("HH:mm")
        } else {
          body['createdt'] = moment(body.createdt).format("LLL")
        }
        this.messages.push(body)
        setTimeout(()=>{
          $("#scrollMe").mCustomScrollbar("scrollTo","bottom");
        }, 2000)
      })
    })
  }

  showUser(id){
    let user = _.filter(this.users, function (o){ return o._id == id})
    this.userImageDisplay = user[0].meta.split('|')[0]
    this.userName = user[0].name
  }

  logout() {
    this.disconnect()
    localStorage.clear()
    this.router.navigate([''])
  }
}
