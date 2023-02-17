import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { CognitoService } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router, private cognitoService: CognitoService, private logger: Logger) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // keep the requested url for redirect after login
    let url: string = state.url;

    var authenticated = this.cognitoService.isAuthenticated();

    var subject = new Subject<boolean>();

    authenticated.then(

      (isAuthenticated: boolean) => {
        //if not authenticated redirect to the login route with the initial route attached as a query param 'returnUrl'
        if (!isAuthenticated) {
          this.logger.log("User is not authenticated");
          this.router.navigate(['/signIn'], { queryParams: { returnUrl: url } });
        } else {

          // the user is authenticated just go to the requested route
          this.logger.log("User is authenticated");

          subject.next(isAuthenticated);

        }
      }
    );

    return subject.asObservable();

  }
  
}
