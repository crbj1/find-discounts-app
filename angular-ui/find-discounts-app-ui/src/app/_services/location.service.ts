import { Injectable } from '@angular/core';

import * as AmazonLocation from 'amazon-location-helpers';
import * as maplibregl from 'maplibre-gl';
import * as AWS from 'aws-sdk';

import { environment } from 'src/environments/environment';
import { Logger } from './logging.service';
import { Location } from '../_models/location';
import { RestService } from './rest.service';
import { take } from 'rxjs';
import { GetUserResponse } from '../_models/getUserResponse';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  map: maplibregl.Map;

  constructor(private logger: Logger, private restService: RestService) { }

  public async initializeMap(): Promise<void> {

    const map = await AmazonLocation.createMap(
      {
        identityPoolId: environment.IDENTITY_POOL_ID
      },
      {
        container: "map",
        center: [-92.1171, 32.5046], // initial map center point
        zoom: 11, // initial map zoom
        style: environment.MAP_NAME,
        // hash: true
      }
    );

    map.addControl(new maplibregl.NavigationControl(), "top-left");

    this.map = map;

  }

  public async addMarker(restLocation: Location): Promise<void> {

    //Get the location data from AWS
    const location = new AWS.Location({
      credentials: await AmazonLocation.getCredentialsForIdentityPool(environment.IDENTITY_POOL_ID),
      region: "us-east-1"
    });

    const data = await location.searchPlaceIndexForText({
      IndexName: environment.INDEX_NAME,
      Text: restLocation.address
    }).promise();

    this.logger.log("Location retrieved from AWS in country " + data.Results[0].Place.Country);

    const position = data.Results[0].Place.Geometry.Point;

    this.restService.getUser(restLocation.createdByRestUserId)
    .pipe(take(1))
    .subscribe({
      next: (response: GetUserResponse) => {

        // create the popup
        var popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `${restLocation.name}
        <br>${restLocation.address}
        <br>Created by ${response.Item.firstName} ${response.Item.lastName}`
        );

        // create DOM element for the marker
        var el = document.createElement('div');
        el.id = 'marker';

        // create the marker
        new maplibregl.Marker(el)
        .setLngLat([position[0], position[1]])
        .setPopup(popup)
        .addTo(this.map);

      },
      error: (err: any) => {
        this.logger.error("Rest service failed to get user", err);
      }
    }); 

  }

}
