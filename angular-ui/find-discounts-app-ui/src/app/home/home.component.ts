import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { take } from 'rxjs';

import { LocationService } from '../_services/location.service';
import { RestService } from '../_services/rest.service';
import { Logger } from '../_services/logging.service';

import { Location } from '../_models/location';
import { LocationDatabaseScan } from '../_models/locationDatabaseScan';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  constructor (private locationService: LocationService, private restService: RestService, private logger: Logger) {
  }

  async ngOnInit(): Promise<void> {
    
    await Promise.all([this.locationService.initializeMap(), this.locationService.setCurrentUserRestId()]);

    this.restService.getLocations()
    .pipe(take(1))
    .subscribe({
      next: (locationDatabaseScan: LocationDatabaseScan) => {
        const locations = locationDatabaseScan.Items;
        locations.forEach((value: Location, index: number, array: Location[]) => {
          //this.logger.log("Initializing marker with name " + value.name);
          this.locationService.addMarker(value);
        });
      },
      error: (error) => {
        this.logger.error("Failed to get locations", error);
      }
    });
    
  }

}
