import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientDetails: any;
  @Output() setTab = new EventEmitter<number>()

  messages: any
  content: any

  constructor(
    private messageService: MessageService,
    private alertifyService: AlertifyService
  ) { }

  ngOnInit() {
    this.loadMessages()
  }

  loadMessages() {
    this.messageService.getMessageThread(this.recipientDetails.recipientId).subscribe((messages: { response, updateList }) => {
      this.messages = messages.response
      if (messages.updateList !== 0) {
        this.setTab.emit(3)
        const notifications = +localStorage.getItem('notifications')
        if (notifications <= 1) {
          localStorage.removeItem('notifications')
        } else {
          localStorage.setItem('notifications', (notifications - 1).toString())
        }
      }
    }, error => {
      this.alertifyService.error(error.error)
    })
  }

  sendMessage() {
    this.messageService.sendMessage(this.recipientDetails.recipientId, this.content).subscribe(response => {
      this.messages.splice(this.messages.length, 0, response)
      this.content = ''
    }, error => {
      this.alertifyService.error(error.error)
    })
  }

}
