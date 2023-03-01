import { Injectable } from '@angular/core';

import * as AmazonLocation from 'amazon-location-helpers';
import * as maplibregl from 'maplibre-gl';
import * as AWS from 'aws-sdk';

import { environment } from 'src/environments/environment';
import { Logger } from './logging.service';
import { Location } from '../_models/location';
import { RestService } from './rest.service';
import { Observable, Subscription, take } from 'rxjs';
import { GetUserResponse } from '../_models/getUserResponse';
import { CognitoService } from './cognito.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private map: maplibregl.Map;
  private markers: Map<string, maplibregl.Marker>;
  private currentUserRestId: string

  constructor(private logger: Logger, private restService: RestService, private cognitoService: CognitoService) {
    this.markers = new Map<string, maplibregl.Marker>();
    this.currentUserRestId = '';
  }

  public getMarkers(): Map<string, maplibregl.Marker> {
    return this.markers;
  }

  public removeMarkerFromList(key: string) {
    this.markers.delete(key);
  }

  public async setCurrentUserRestId(): Promise<void> {
    const user = await this.cognitoService.getUser();
    this.currentUserRestId = user.attributes['custom:restId'];
  }

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

    //this.logger.log("Location retrieved from AWS in country " + data.Results[0].Place.Country);

    const position = data.Results[0].Place.Geometry.Point;

    this.restService.getUser(restLocation.createdByRestUserId)
    .pipe(take(1))
    .subscribe({
      next: (response: GetUserResponse) => {
        
        var idsMatch: boolean = false;
        if (Object.keys(response).length !== 0) {
          if (this.currentUserRestId === response.Item.userId) {
            idsMatch = true;
          }
        }

        // create the popup
        var popup: maplibregl.Popup;
        if (idsMatch) {
          popup = new maplibregl.Popup({ offset: 25 }).setHTML(
            `<p>${restLocation.name}
            <br>${restLocation.address}
            <br>Created by ${response.Item.firstName} ${response.Item.lastName}</p>
            <p>
              <a href="/home/edit/${restLocation.locationId}" class="nav-link" style="color: blue">Edit Location</a>
              <a href="/home/delete/${restLocation.locationId}" class="nav-link" style="color: blue">Delete Location</a>
            </p>`
          );
        } else if (Object.keys(response).length !== 0){
          popup = new maplibregl.Popup({ offset: 25 }).setHTML(
            `<p>${restLocation.name}</p>
            <p>${restLocation.address}</p>
            <p>Created by ${response.Item.firstName} ${response.Item.lastName}</p>`
          );
        } else {
          popup = new maplibregl.Popup({ offset: 25 }).setHTML(
            `<p>${restLocation.name}</p>
            <p>${restLocation.address}</p>
            <p>Created by unknown</p>`
          );
        }

        // create DOM element for the marker
        var el = document.createElement('div');
        el.id = 'marker';

        // create the marker
        const marker = new maplibregl.Marker(el)
        .setLngLat([position[0], position[1]])
        .setPopup(popup)
        .addTo(this.map);

        this.markers.set(restLocation.locationId, marker);

      },
      error: (err: any) => { //User does not exist
        this.logger.error("Failed to get REST User");
        this.logger.error(err);
      }
    }); 

  }

}
