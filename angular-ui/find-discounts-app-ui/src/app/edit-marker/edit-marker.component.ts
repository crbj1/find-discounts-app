import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { GetLocationResponse } from '../_models/getLocationResponse';
import { Location } from '../_models/location';
import { LocationService } from '../_services/location.service';
import { Logger } from '../_services/logging.service';
import { RestService } from '../_services/rest.service';

@Component({
  selector: 'app-edit-marker',
  templateUrl: './edit-marker.component.html',
  styleUrls: ['./edit-marker.component.scss']
})
export class EditMarkerComponent implements OnInit{

  loading: boolean;
  submitted: boolean;
  location: Location;

  constructor(private router: Router, private restService: RestService, private route: ActivatedRoute, private locationService: LocationService, private logger: Logger) {
    this.loading = true;
    this.submitted = false;
    this.location = {} as Location;
  }

  ngOnInit(): void {
    const locationId = this.route.snapshot.paramMap.get("id");

    this.restService.getLocation(locationId)
    .pipe(take(1))
    .subscribe({
      next: (value: GetLocationResponse) => {
        this.location = value.Item;
        this.loading = false;
      },
      error: (err: any) => {
        this.logger.error("Failed to get location from AWS", err);
        this.router.navigate(['/home']);
      }
    });
  }

  updateLocation() {
    this.loading = true;

    this.restService.updateLocation(this.location)
    .pipe(take(1))
    .subscribe({
      next: (value: Location) => {
        //remove old marker
        this.locationService.getMarkers().get(this.location.locationId).remove();
        this.locationService.removeMarkerFromList(this.location.locationId);

        //create new marker with updated data
        this.locationService.addMarker(this.location);

        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.logger.error("Failed to update location", err);
        this.loading = false;
      }
    });
  }

}
