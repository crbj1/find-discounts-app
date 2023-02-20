import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { first } from 'rxjs';

import { LocationService } from '../_services/location.service';
import { RestService } from '../_services/rest.service';

import { Location } from '../_models/location';
import { Logger } from '../_services/logging.service';
import { LocationDatabaseScan } from '../_models/locationDatabaseScan';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  constructor (private locationService: LocationService, private restService: RestService, private logger: Logger) {
  }

  ngOnInit(): void {
    this.locationService.initializeMap();

    this.restService.getLocations()
    .pipe(first())
    .subscribe({
      next: (locationDatabaseScan: LocationDatabaseScan) => {
        this.logger.log("Inside HomeComponent:this.restService.getLocations().subscribe.next");
        const locations = locationDatabaseScan.Items;
        this.logger.log("Locations: " + locations.toString());
        locations.forEach((value: Location, index: number, array: Location[]) => {
          this.locationService.addMarkerFromText(value.address);
        });
      },
      error: (error) => {
        this.logger.error(error);
      }
    });
    
  }

}
