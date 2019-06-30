import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AlertifyService } from '../services/alertify.service';
import { Router } from '@angular/router';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  isLodding = false

  constructor(
    private authService: AuthService,
    private alertifyService: AlertifyService,
    private messageService:MessageService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  logInForm = new FormGroup({
    userName: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  login() {
    this.isLodding = true
    if (this.logInForm.valid) {
      this.authService.login(this.logInForm.value).subscribe(() => {
        this.isLodding = false
      }, error => {
        this.alertifyService.error(error.error.message || error.error.error.message)
        this.isLodding = false
      }, () => {
        this.router.navigate(['members'])
      })
    } else {
      this.alertifyService.error("Required Error")
      this.isLodding = false
    }
  }

  isLoggedIn() {
    return this.authService.isLoggedIn
  }

  logOut() {
    localStorage.clear()
    this.alertifyService.message("Logged out")
    this.router.navigate(['home'])
  }

}
