import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';

import { CognitoService } from '../_services/cognito.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router, private cognitoService: CognitoService) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    
    const isAuthenticated = this.cognitoService.isAuthenticated();
    if (isAuthenticated) {
      return true;
    }

    this.router.navigate(['/signIn'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
}
