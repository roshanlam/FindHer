import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { AuthService } from 'src/app/services/auth.service';
import { PhotoService } from 'src/app/services/photo.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: any
  @Output() getMemberPhotoChange = new EventEmitter<string>()

  uploader: FileUploader
  hasBaseDropZoneOver: boolean = false

  constructor(
    private authService: AuthService,
    private photoService: PhotoService,
    private alertifyService: AlertifyService
  ) { }

  ngOnInit() {
    this.initializeUploader()
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: "api/photos/" + this.authService.getLoginDetails._id,
      authToken: "Bearer " + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    })

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res = JSON.parse(response)
        this.photos.push(res)
        if (res.isMain) {
          localStorage.setItem('mainPhotoUrl', res.url)
          this.getMemberPhotoChange.emit(res.url)
        }
      }
    }
  }

  setMainPhoto(photo) {
    this.photoService.setMainPhoto(photo._id).subscribe((response: { message }) => {
      const currentMainPhoto: any = this.photos.filter(p => p.isMain === true)[0]
      currentMainPhoto.isMain = false
      photo.isMain = true
      localStorage.setItem('mainPhotoUrl', photo.url)
      this.getMemberPhotoChange.emit(photo.url)
      this.alertifyService.success(response.message)
    }, error => {
      this.alertifyService.error(error.error.message || error.error.error.message)
    })
  }

  deletePhoto(id) {
    this.alertifyService.confirm("Are you sure you want to delete this photo?", () => {
      this.photoService.deletePhoto(id).subscribe((response: { message }) => {
        this.photos.splice(this.photos.findIndex(p => p._id === id), 1)
        this.alertifyService.success(response.message)
      }, error => {
        this.alertifyService.error(error.error.message || error.error.error.message)
      })
    })
  }

}
