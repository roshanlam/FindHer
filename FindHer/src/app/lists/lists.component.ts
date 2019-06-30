import { Component, OnInit } from '@angular/core';
import { AlertifyService } from '../services/alertify.service';
import { LikeService } from '../services/like.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  likeUserDetails: any
  pagination: any = { currentPage: 1 }
  route = "likers"
  constructor(
    private likeService: LikeService,
    private alertifyService: AlertifyService,
    private activatedRoute: ActivatedRoute
  ) { }
  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.likeUserDetails = data['userDetails'].details;
      this.pagination = data['userDetails'].pagination;
    });
  }
  pageChanged(pageNumber) {
    this.pagination.previousPage = pageNumber - 1
    this.pagination.currentPage = pageNumber
    this.pagination.nextPage = pageNumber + 1
    this.loadUsers()
  }
  toggleRoute() {
    this.likeUserDetails = [];
    this.pagination = { currentPage: 1 }
    this.loadUsers()
  }
  loadUsers() {
    this.likeService.getLikeUserDetails(this.route, this.pagination.currentPage).subscribe((userDetails: { details, pagination }) => {
        this.likeUserDetails = userDetails.details
        this.pagination = userDetails.pagination
    }, error => {
      this.alertifyService.error(error.error.message || error.error.error.message)
    })
  }

}
