import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { SecureStorageService } from 'src/app/auth/secure-storage.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user: String = null;
  password: String = null;
  constructor(private auth: AuthService, private secureStorage: SecureStorageService, private router: Router) { }

  ngOnInit() {
    let logged = this.secureStorage.getItem('LOGGED')
    if (logged == 'false' || logged == null) {
      this.router.navigate([''])
    } else if (logged == 'true') {
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

  submit() {
    if (this.user == null || this.user == "") {
      Swal.fire("Opps.. ", "Pleaase Enter Your User ID", "error")
      return
    }

    if (this.password == null || this.password == "") {
      Swal.fire("Opps.. ", "Pleaase Enter Your User ID", "error")
      return
    }
    let data = {
      user: this.user,
      password: this.password
    }
    this.auth.login(data).subscribe(res => {
      if (res.success) {
        this.secureStorage.setItem('LOGGED', "true")
        this.secureStorage.setUserId(res.session._id)
        this.secureStorage.setAuthToken(res.authorization_token)
        this.secureStorage.setItem('loginDate', moment().format('YYYY-MM-DD'))
        this.auth.AUTH_TOKEN = this.secureStorage.getAuthToken();
        this.auth.SESSION_TOKEN = this.secureStorage.getUserId();
        this.router.navigate(['dashboard'])
      } else {
        localStorage.clear()
        Swal.fire("Opps..", res.message, 'error')
      }
    })
  }

}
