import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @HostListener('window: beforeunload', ['$event'])
  BeforeUnloadEvent($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true
    }
  }

  userDetails: any

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertifyService: AlertifyService
  ) { }

  ngOnInit() {
    this.loadUser()
  }

  editForm = new FormGroup({
    introduction: new FormControl(''),
    lookingFor: new FormControl(''),
    interests: new FormControl(''),
    city: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required)
  })

  loadUser() {
    this.userService.getAUser(this.authService.getLoginDetails._id).subscribe(userData => {
      this.userDetails = userData
      this.setEditFormValues()
    }, error => {
      this.alertifyService.error(error.error.message || error.error.error.message)
    })
  }

  setEditFormValues() {
    this.editForm.patchValue({
      introduction: this.userDetails.introduction,
      lookingFor: this.userDetails.lookingFor,
      interests: this.userDetails.interests,
      city: this.userDetails.city,
      country: this.userDetails.country
    })
  }

  updateUser() {
    this.userService.updateUser(this.authService.getLoginDetails._id, this.editForm.value).subscribe((response: { message }) => {
      this.alertifyService.success(response.message)
      this.editForm.reset(this.editForm.value)
    }, error => {
      this.alertifyService.error(error.error.message || error.error.error.message)
    })
  }

  updateMainPhoto(photoUrl) {
    this.userDetails.photoUrl = photoUrl
  }

}
