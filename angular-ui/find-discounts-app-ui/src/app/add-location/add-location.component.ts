import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { Location } from '../_models/location';
import { CognitoService } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';
import { RestService } from '../_services/rest.service';

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss']
})
export class AddLocationComponent {

  loading: boolean;
  location: Location;

  constructor(private router: Router, private restService: RestService, private cognitoService: CognitoService, private logger: Logger) {
    this.loading = false;
    this.location = {} as Location;
  }

  public addLocation() {

    this.loading = true;

    this.cognitoService.getUser()
    .then((userInfo) => {

      this.location.createdByRestUserId = userInfo.attributes['custom:restId']
      this.logger.log("Created by user with REST id " + this.location.createdByRestUserId);

      this.restService.createLocation(this.location)
      .pipe(take(1))
      .subscribe({
        next: (data: Location) => {
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.logger.error(error);
          this.loading = false;
        }
      });

    }).catch((reason: any) => {
      this.logger.error(reason);
      this.loading = false;
    });

  }

}
