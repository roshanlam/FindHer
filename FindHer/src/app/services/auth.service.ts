import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AlertifyService } from './alertify.service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userUrl = 'api/users/'
  private jwtHelper = new JwtHelperService();
  private decodedToken: any

  constructor(
    private http: HttpClient,
    private messageService:MessageService,
    private alertifyService: AlertifyService) { }

  get getLoginDetails() {
    return this.jwtHelper.decodeToken(localStorage.getItem('token'))
  }

  get mainPhotoUrl() {
    return localStorage.getItem('mainPhotoUrl')
  }

  login(loginDetails) {
    return this.http.post(this.userUrl + "login", loginDetails).pipe(map((res: any) => {
      if (res.token) {
        this.alertifyService.success(res.message)
        localStorage.setItem('token', res.token)
        localStorage.setItem('mainPhotoUrl', res.mainPhotoUrl)
        this.messageService.getUnreadMessagesCount().subscribe()
      }
    }))
  }

  register(registerDetails) {
    return this.http.post(this.userUrl + "signup", registerDetails)
  }

  get isLoggedIn() {
    return !this.jwtHelper.isTokenExpired(localStorage.getItem('token'))
  }

}
