import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Location } from '../_models/location';
import { CognitoService, IUser } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';
import { RestService } from '../_services/rest.service';

@Injectable({
  providedIn: 'root'
})
export class LocationGuard implements CanActivateChild {

  constructor(private cognitoService: CognitoService, private restService: RestService, private router: Router, private logger: Logger) {}
  
  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    const id = route.paramMap.get("id");
    const promiseArray = await Promise.all([this.cognitoService.getUser(), firstValueFrom(this.restService.getLocation(id))]);

    const currentUser: IUser = promiseArray[0].attributes;
    const location: Location = promiseArray[1].Item;

    if (currentUser['custom:restId'] === location.createdByRestUserId) {
      return true;
    }

    this.logger.log("User is not authorized to edit this location");
    this.router.navigate(['/home']);

  }
  
}
