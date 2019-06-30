import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private photoUrl = 'api/photos'

  constructor(private http: HttpClient) { }

  setMainPhoto(id) {
    return this.http.patch(this.photoUrl + "/setMain/" + id, {})
  }

  deletePhoto(id) {
    return this.http.delete(this.photoUrl + "/" + id)
  }

}
