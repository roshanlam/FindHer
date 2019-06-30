import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  private likeUrl = 'api/likes'

  constructor(private http: HttpClient) { }

  sendLike(id) {
    return this.http.post(this.likeUrl + "/" + id, {})
  }

  getLikeUserDetails(route, page?) {
    let params = new HttpParams()
    if (page) {
      params = params.append('page', page)
    }
    return this.http.get(this.likeUrl + "/" + route, { params })
  }

}
