import * as moment from 'moment';
import * as _ from 'lodash';
import * as io from 'socket.io-client';
import { Component, OnInit, OnDestroy, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { SecureStorageService } from 'src/app/auth/secure-storage.service';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { SocketService } from 'src/app/services/socket.service';
import { variables } from 'src/environments/variables'

declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private observableRoomDataSubscription: Subscription;
  private observableMessagesSubscription: Subscription;

  public searching: boolean = false;
  public rooms_show: boolean = true;
  public event_rooms_show: boolean = false;
  public artist_rooms_show: boolean = false;
  public video_rooms_show: boolean = false;

  public session: any = {}

  private origin: String = variables.origin
  private url = this.origin;
  private socket;
  AUTH_TOKEN = this.secureStorage.getAuthToken();
  SESSION_TOKEN = this.secureStorage.getUserId();

  all_rooms: any = [];
  rooms: any = [];
  event_rooms: any = [];
  artist_rooms: any = [];
  video_rooms: any = [];

  rooms_searching: any = [];
  event_rooms_searching: any = [];
  artist_rooms_searching: any = [];
  video_rooms_searching: any = [];

  active: String = null
  activeChat: any = {}

  message: string = "";
  userImage: string = "";
  userImageDisplay: string = "";
  userName: string = "";
  messages: any[] = [];
  deleteMessageButton: any[] = [];
  users: string[] = [];
  search: string
  constructor(private auth: AuthService, private chatService: ChatService, private secureStorage: SecureStorageService, private router: Router, private zone: NgZone) { }
  join(room) {
    this.socket.emit('join', { authorization_token: this.AUTH_TOKEN, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }
  getMessages = () => {
    return new Observable((observer) => {
      this.socket.on('message', (message) => {
        observer.next(message);
      });
    });
  }
  getRoomData = () => {
    return new Observable((observer) => {
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
        this.observableMessagesSubscription = this.getMessages()
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
                  _id: message._id
                }
                if (moment().format('YY-MM-DD') == moment(body.createdt).format('YY-MM-DD')) {
                  body['createdt'] = moment(body.createdt).format("HH:mm")
                } else {
                  body['createdt'] = moment(body.createdt).format("LLL")
                }
                this.messages.push(body);
                this.deleteMessageButton[message._id] = false
                setTimeout(() => {
                  $("#scrollMe").mCustomScrollbar("scrollTo", "bottom");
                }, 1000)
              } else if (message.i == true) {
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
                setTimeout(() => {
                  $("#scrollMe").mCustomScrollbar("scrollTo", "bottom");
                }, 1000)
              }
            })
          });
        this.observableRoomDataSubscription = this.getRoomData()
          .subscribe((users: any) => {
            this.zone.run(() => { // <== added
              this.users = users.users;
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
    this.observableRoomDataSubscription.unsubscribe();
    this.observableMessagesSubscription.unsubscribe();
    this.socket.emit('disconnect', ({}));
  }

  fetchData() {
    this.chatService.getRooms().subscribe(res => {
      this.all_rooms = res.rooms
      res.rooms.forEach(room => {
        room.meta = room.meta.split('|')
        let type = room.meta[0].split(' ')[0]
        if (type == 'EVENT') {
          this.event_rooms.push(room)
        } else if (type == 'ARTIST') {
          this.artist_rooms.push(room)
        } else if (type == 'VIDEO') {
          this.video_rooms.push(room)
        } else {
          this.rooms.push(room)
        }
      })
      console.log(this.all_rooms)
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
            info: false,
            _id: message._id
          }
          if (moment().format('YY-MM-DD') == moment(body.createdt).format('YY-MM-DD')) {
            body['createdt'] = moment(body.createdt).format("HH:mm")
          } else {
            body['createdt'] = moment(body.createdt).format("LLL")
          }
          this.messages.push(body)
          this.deleteMessageButton[message._id] = false
          setTimeout(() => {
            $("#scrollMe").mCustomScrollbar("scrollTo", "bottom");
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
    this.activeChat = _.find(this.all_rooms, room => { return room._id == id })

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
          info: false,
          _id: message._id
        }
        if (moment().format('YY-MM-DD') == moment(body.createdt).format('YY-MM-DD')) {
          body['createdt'] = moment(body.createdt).format("HH:mm")
        } else {
          body['createdt'] = moment(body.createdt).format("LLL")
        }
        this.messages.push(body)
        this.deleteMessageButton[message._id] = false
        setTimeout(() => {
          $("#scrollMe").mCustomScrollbar("scrollTo", "bottom");
        }, 2000)
      })
    })
  }
  keyDownFunctionSearch(event) {
    if (this.search != "") {
      this.rooms_searching = []
      this.artist_rooms_searching = []
      this.event_rooms_searching = []
      this.video_rooms_searching = []
      this.searching = true 
      let reg = new RegExp('(?=.*' + this.search.split(/\,|\s/).join(')(?=.*') + ')', 'gi')
      let foundRooms = this.all_rooms.filter(r => r.meta[0].match(reg)); 
      foundRooms.forEach(room => {
        let type = room.meta[0].split(' ')[0]
        if (type == 'EVENT') {
          this.event_rooms_searching.push(room)
        } else if (type == 'ARTIST') {
          this.artist_rooms_searching.push(room)
        } else if (type == 'VIDEO') {
          this.video_rooms_searching.push(room)
        } else {
          this.rooms_searching.push(room)
        }
      })
    } else {
      this.searching = false
      this.rooms_searching = []
      this.artist_rooms_searching = []
      this.event_rooms_searching = []
      this.video_rooms_searching = []
    }
  }
  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.sendMessage()
      // rest of your code
    }
  }
  // showUser(id) {
  //   let user = _.filter(this.users, function (o){ return o._id == id})
  //   console.log(this.users, user)
  //   this.userImageDisplay = user[0].meta.split('|')[0]
  //   this.userName = user[0].name
  // }
  deleteMessage(id) {
    if (confirm("Do you want to remove this message?")) {
      this.chatService.deleteRoomMessage({ id }).subscribe((res) => {
        if (res.success) {
          var element = document.getElementById(id);
          element.parentNode.removeChild(element);
        } else {
          Swal.fire("Opps", res.nessage, "error");
        }
      })
    }
  }

  logout() {
    this.disconnect()
    localStorage.clear()
    this.router.navigate([''])
  }
}
