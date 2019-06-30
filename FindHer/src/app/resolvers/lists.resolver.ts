import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LikeService } from '../services/like.service';
import { AlertifyService } from '../services/alertify.service';

@Injectable()
export class ListsResolver implements Resolve<any> {

    pagination: any = { currentPage: 1 }
    route = "likers"

    constructor(
        private likeService: LikeService,
        private alertifyService: AlertifyService,
        private router: Router) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return this.likeService.getLikeUserDetails(this.route, this.pagination.currentPage).pipe(
            catchError(error => {
                this.alertifyService.error(error.error.message || error.error.error.message);
                this.router.navigate(['home']);
                return of(null);
            })
        );
    }
}
