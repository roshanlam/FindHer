import { Injectable } from '@angular/core';
declare let alertify: any

@Injectable({
  providedIn: 'root'
})
export class AlertifyService {

constructor() { }

confirm(message,okCallBack: () => any) {
  alertify.confirm(message, function (ok) {
    if (ok) {
      okCallBack()
    }
  })
}

success(message) {
  alertify.success(message)
}

error(message) {
  alertify.error(message)
}

warning(message) {
  alertify.warning(message)
}

message(message) {
  alertify.message(message)
}

}
