import { Component, OnInit, Input } from '@angular/core';
import { LikeService } from 'src/app/services/like.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() user: any
  constructor(
    private likeService: LikeService,
    private alertifyService: AlertifyService
  ) { }

  ngOnInit() {
  }
  sendLike(id) {
    this.likeService.sendLike(id).subscribe((response: { message }) => {
      this.alertifyService.success(response.message)
      this.user.likeThisPerson = this.user.likeThisPerson === true ? false : true
    }, error => {
      this.alertifyService.error(error.error.message || error.error.error.message)
    })
  }

}
