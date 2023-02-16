import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

import { LocationService } from '../_services/location.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  constructor (private locationService: LocationService) {
  }

  ngOnInit(): void {
    this.locationService.initializeMap();
  }

}
