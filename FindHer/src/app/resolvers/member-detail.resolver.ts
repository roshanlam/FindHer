import { Injectable, ViewChild } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AlertifyService } from '../services/alertify.service';
import { TabsetComponent } from 'ngx-bootstrap';

@Injectable()
export class MemberDetailResolver implements Resolve<any> {
    @ViewChild('memberTabs') memberTabs: TabsetComponent
    constructor(
        private userService: UserService,
        private router: Router,
        private alertify: AlertifyService
    ) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return this.userService.getAUser(route.params['id']).pipe(
            catchError(error => {
                this.alertify.error(error.error.message || error.error.error.message);
                this.router.navigate(['members']);
                return of(null);
            })
        );
    }
}
