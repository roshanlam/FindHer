import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { AlertifyService } from '../services/alertify.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  messages: any

  constructor(
    private messageService:MessageService,
    private alertifyService:AlertifyService
  ) { }

  ngOnInit() {
    this.loadMessages()
  }

  loadMessages() {
    this.messageService.getUnreadMessages().subscribe(messages => {
      this.messages = messages
      if (!this.messages[0])
      this.alertifyService.error("No new messages found")
    },error =>{
      this.alertifyService.error(error.error)
    })
  }

}
