import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { TabsetComponent } from 'ngx-bootstrap';
import { LikeService } from 'src/app/services/like.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs') memberTabs: TabsetComponent

  aUserDetails: any
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(
    private likeService: LikeService,
    private alertifyService: AlertifyService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.aUserDetails = data['aUserDetails'];
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const selectedTab = params['tab'];
      this.memberTabs.tabs[selectedTab > 0 ? selectedTab : 0].active = true;
    });

    this.galleryOptions = [
      {
        width: '700px',
        height: '500px',
        imagePercent: 150,
        thumbnailsColumns: 6,
        imageAnimation: NgxGalleryAnimation.Slide
      }
    ]
    this.galleryImages = this.getImages();

  }

  getImages() {
    const imgUrl = []
    this.aUserDetails.photos.forEach(element => {
      imgUrl.push({
        small: element.url,
        medium: element.url,
        big: element.url,
        description: element.description
      })
    });
    return imgUrl
  }

  sendLike(id) {
    this.likeService.sendLike(id).subscribe((response: { message }) => {
      this.alertifyService.success(response.message)
      this.aUserDetails.likeThisPerson = this.aUserDetails.likeThisPerson === true ? false : true
    }, error => {
      this.alertifyService.error(error.error.message || error.error.error.message)
    })
  }

  selectTab(tabId) {
    this.memberTabs.tabs[tabId].active = true
  }

}
