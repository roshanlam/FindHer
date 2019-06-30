import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AlertifyService } from '../services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter()

  isLodding = false

  constructor(
    private authService: AuthService,
    private alertifyService: AlertifyService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  registerForm = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.pattern("[a-zA-Z]*")
    ]),
    password: new FormControl('',
      [
        Validators.required,
        Validators.minLength(4)
      ]),
    confirmPassword: new FormControl('', Validators.required),
    knownAs: new FormControl('', [
      Validators.required,
      Validators.pattern("[a-zA-Z]*")
    ]),
    gender: new FormControl('male'),
    dateOfBirth: new FormControl(null, [
      Validators.required,
      this.checkAdult
    ]),
    city: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required)
  }, this.passwordMatchValidator);

  get userName() {
    return this.registerForm.get('userName')
  }

  get password() {
    return this.registerForm.get('password')
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')
  }

  get knownAs() {
    return this.registerForm.get('knownAs')
  }

  get dateOfBirth() {
    return this.registerForm.get('dateOfBirth')
  }

  get city() {
    return this.registerForm.get('city')
  }

  get country() {
    return this.registerForm.get('country')
  }

  passwordMatchValidator(form) {
    return form.get('password').value === form.get('confirmPassword').value ? null : { 'mismatch': true }
  }

  checkAdult(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      if(new Date(new Date().getTime() - new Date(control.value).getTime()).getFullYear() < 1988) {
        return { adult: true }
      }
    }
    return null
  }

  register() {
    this.isLodding = true
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe((response: { message }) => {
        this.alertifyService.success(response.message)
      }, error => {
        this.isLodding = false
        this.alertifyService.error(error.error.message || error.error.error.message)
      }, () => {
        this.authService.login(this.registerForm.value).subscribe(() => {
          this.isLodding = false
          this.router.navigate(['members'])
        })
      })
    } else {
      this.isLodding = false
      this.alertifyService.error(this.registerForm.status)
    }
  }

  cancel() {
    this.cancelRegister.emit(false)
  }

}
