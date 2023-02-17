import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs';

import { Location } from '../_models/location';
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

  constructor(private router: Router, private restService: RestService, private logger: Logger) {
    this.loading = false;
    this.location = {} as Location;
  }

  public addLocation() {
    this.loading = true;
    this.restService.createLocation(this.location)
    .pipe(first())
    .subscribe({
      next: (data) => {
        this.logger.log('Newly created user: ' + data);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.logger.error(error);
        this.loading = false;
      }
    })
  }

}
