import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { LocationService } from '../_services/location.service';
import { Logger } from '../_services/logging.service';
import { RestService } from '../_services/rest.service';

@Component({
  selector: 'app-delete-marker',
  templateUrl: './delete-marker.component.html',
  styleUrls: ['./delete-marker.component.scss']
})
export class DeleteMarkerComponent implements OnInit {
  
  loading: boolean;
  locationId: string;

  constructor(private restService: RestService, private locationService: LocationService, private router: Router, private route: ActivatedRoute, private logger: Logger) {
    this.loading = false;
    this.locationId = '';
  }

  ngOnInit(): void {
    this.locationId = this.route.snapshot.paramMap.get("id");
  }

  deleteLocation(): void {
    this.loading = true;
    this.restService.deleteLocation(this.locationId)
    .pipe(take(1))
    .subscribe({
      next: (value: string) => {
        this.logger.log("Deleted location with id " + value);
        this.locationService.getMarkers().get(this.locationId).remove();
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.logger.error("Failed to delete location", err);
      }
    });
  }

  returnHome(): void {
    this.router.navigate(['/home']);
  }

}
