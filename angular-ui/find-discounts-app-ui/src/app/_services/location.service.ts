import { Injectable } from '@angular/core';

import * as AmazonLocation from 'amazon-location-helpers';
import * as maplibregl from 'maplibre-gl';

import { environment } from 'src/environments/environment';
import { Logger } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private logger: Logger) { }

  public async initializeMap() {

    this.logger.log("Starting initializeMap() function");
    const map = await AmazonLocation.createMap(
      {
        identityPoolId: environment.IDENTITY_POOL_ID
      },
      {
        container: "map",
        center: [-123.1187, 49.2819], // initial map center point
        zoom: 10, // initial map zoom
        style: environment.MAP_NAME,
        hash: true
      }
    );

    this.logger.log("Map created");
    map.addControl(new maplibregl.NavigationControl(), "top-left");
    this.logger.log("Control added");

  }
}
