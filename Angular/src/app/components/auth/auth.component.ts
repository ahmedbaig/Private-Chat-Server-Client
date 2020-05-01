import { Component, OnInit } from '@angular/core';
import { SecureStorageService } from 'src/app/auth/secure-storage.service';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(private secureStorage:SecureStorageService, private router: Router) { }

  ngOnInit() {
    let logged = this.secureStorage.getItem('LOGGED')
    if(logged=='false'||logged==null){
      this.router.navigate([''])
    }else if(logged=='true'){
      let loginDate = this.secureStorage.getItem('loginDate');
      let current = moment().startOf('day');
      let DayPassed = moment.duration(current.diff(loginDate)).asDays();
      if (DayPassed < 5) {
        this.router.navigate(['dashboard']);
      }
      else {
        localStorage.clear();
        this.router.navigate(['']);
      }
    }
  }

}
