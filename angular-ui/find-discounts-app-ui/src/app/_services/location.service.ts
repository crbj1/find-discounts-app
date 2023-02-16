import { Injectable } from '@angular/core';

import { createMap } from 'amazon-location-helpers';
import { NavigationControl } from 'maplibre-gl';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  public async initializeMap() {
    const map = await createMap(
      {
        identityPoolId: ""
      },
      {
        container: "map",
        center: [-123.1187, 49.2819], // initial map center point
        zoom: 10, // initial map zoom
        style: "find-discounts-dev-map",
        hash: true
      }
    );

    map.addControl(new NavigationControl(), "top-left");
    
  }
}
