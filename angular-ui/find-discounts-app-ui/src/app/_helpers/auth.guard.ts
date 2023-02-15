import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';

import { CognitoService } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router, private cognitoService: CognitoService, private logger: Logger) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    
    return this.cognitoService.isAuthenticated()
    .then((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        this.logger.log("User is authenticated, going to home");
        return true;
      } else {
          this.logger.log("User is not authenticated, going to signIn");
          this.router.navigate(['/signIn'], { queryParams: { returnUrl: state.url } });
          return false;
      }
    });

  }
  
}
