import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private messageUrl = 'api/messages'

  constructor(private http: HttpClient) { }

  get notifications() {
    return localStorage.getItem('notifications')
  }

  getUnreadMessages() {
    return this.http.get(this.messageUrl)
  }

  getUnreadMessagesCount() {
    return this.http.get(this.messageUrl + "/messageNotification").pipe(map((res: string) => {
      if (res) {
        localStorage.setItem('notifications', res)
      }
    }))
  }

  getMessageThread(id) {
    return this.http.get(this.messageUrl + "/" + id)
  }

  sendMessage(id, content) {
    return this.http.post(this.messageUrl + "/" + id, {content})
  }

}
