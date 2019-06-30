import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  allUserDetails: any
  pagination: any = { currentPage: 1 }
  genderList = [{ value: 'male', name: 'Males' }, { value: 'female', name: 'Females' }]
  userParams: any = {}

  constructor(
    private userService: UserService,
    private alertifyService: AlertifyService
  ) { }

  ngOnInit() {
    this.loadUsers()
  }

  pageChanged(pageNumber) {
    this.pagination.previousPage = pageNumber - 1
    this.pagination.currentPage = pageNumber
    this.pagination.nextPage = pageNumber + 1
    this.loadUsers()
  }

  resetFilter() {
    this.userParams = {}
    this.loadUsers()
  }
  loadUsers() {
    this.userService.getAllUsers(this.pagination.currentPage, this.userParams).subscribe((userDetails: { details, pagination }) => {
      this.allUserDetails = userDetails.details
      this.pagination = userDetails.pagination
      if(this.allUserDetails[0])
      this.userParams.gender = this.allUserDetails[0].gender
    }, error => {
      this.alertifyService.error(error.error.message || error.error.error.message)
    })
  }

}
