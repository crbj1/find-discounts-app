import { Component, OnInit } from '@angular/core';
import { first, take } from 'rxjs';
import { GetUserResponse } from '../_models/getUserResponse';
import { User } from '../_models/user';

import { IUser, CognitoService } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';
import { RestService } from '../_services/rest.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  loading: boolean;
  user: IUser;
  restUser: User;

  constructor(private cognitoService: CognitoService, private restService: RestService, private logger: Logger) {
    this.loading = false;
    this.user = {} as IUser;
    this.restUser = {} as User;
  }

  public ngOnInit(): void {
    this.cognitoService.getUser()
    .then((user: any) => {
      this.user = user.attributes;
      //this.logger.log("Getting REST user with id: " + this.user['custom:restId']);
      this.restService.getUser(this.user['custom:restId'])
      .pipe(take(1))
      .subscribe({
        next: (restResponse: GetUserResponse) => {
          this.restUser = restResponse.Item;
          //this.logger.log("First name: " + this.restUser.firstName);
        },
        error: (err: any) => {
          this.logger.error(err);
        }
      });
    });
  }

}
