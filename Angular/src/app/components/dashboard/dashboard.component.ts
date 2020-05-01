import { Component, OnInit } from '@angular/core';
import { SecureStorageService } from 'src/app/auth/secure-storage.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // TO Be continued from here: https://codingblast.com/chat-application-angular-socket-io/


  public session:any = {}
  public url:String = null

  rooms: any = [];
  active: String = null
  activeChat: any = {}
  constructor(private auth:AuthService, private chatService: ChatService, private secureStorage:SecureStorageService, private router: Router) { }

  ngOnInit() {
    let logged = this.secureStorage.getItem('LOGGED')
    if(logged=='false'||logged==null){
      this.router.navigate([''])
    }else{
      this.auth.AUTH_TOKEN = this.secureStorage.getAuthToken();
      this.auth.SESSION_TOKEN = this.secureStorage.getUserId();
      let loginDate = this.secureStorage.getItem('loginDate');
      let current = moment().startOf('day');
      let DayPassed = moment.duration(current.diff(loginDate)).asDays();
      if (DayPassed < 5) {
        this.auth.checkUser().subscribe(res=>{
          this.session = res.session
          this.url = res.session.meta.split("|")[0]
        })
        this.fetchData();
      }
      else {
        localStorage.clear();
        this.router.navigate(['']);
      }
    }
  }

  fetchData(){
    this.chatService.getRooms().subscribe(res=>{
      this.rooms = res.rooms
      this.active = this.rooms[0]._id;
      this.activeChat = this.rooms[0]
      console.log(this.activeChat)
      this.rooms.forEach(room => {
        room.meta = room.meta.split('|')
      });
      console.log(this.rooms)
    })
  }

  changeRoom(id){
    this.active = id
    this.activeChat = _.find(this.rooms, room=>{return room._id == id})
    
    console.log(this.activeChat)
  }

  logout(){
    localStorage.clear()
    this.router.navigate([''])
  }

}
