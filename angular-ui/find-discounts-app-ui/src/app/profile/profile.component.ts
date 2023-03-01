import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first, firstValueFrom, take } from 'rxjs';
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
  deleteButtonClicked: boolean;
  error = '';
  inputEmail: string;
  inputError = '';

  constructor(private cognitoService: CognitoService, private restService: RestService, private router: Router, private logger: Logger) {
    this.loading = false;
    this.user = {} as IUser;
    this.restUser = {} as User;
    this.deleteButtonClicked = false;
    this.inputEmail = '';
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

  clickDeleteButton() {
    this.deleteButtonClicked = true;
  }

  unclickDeleteButton() {
    this.deleteButtonClicked = false;
  }

  deleteAccount() {
    this.loading = true;

    if (this.inputEmail !== this.restUser.email) {
      this.inputError = "Emails don't match.";
      this.loading = false;
      return;
    }

    this.restService.deleteUser(this.restUser.userId)
    .pipe(first())
    .subscribe({
      next: (value: string) => {
        this.logger.log("Deleted REST user with id " + value);
        //delete extra email entry (allows usernames to stay unique)
        this.restService.deleteUser(this.restUser.email)
        .pipe(first())
        .subscribe({
          next: async (value: string) => {
            this.logger.log("Deleted REST user with id " + value);
            await this.cognitoService.deleteUser();
            this.router.navigate(['/signIn']);
          },
          error: (err: any) => {
            this.error = "Failed to delete REST user (email entry)";
            this.loading = false;
            this.unclickDeleteButton();
          }
        });
      },
      error: (err: any) => {
        this.error = "Failed to delete REST user";
        this.loading = false;
        this.unclickDeleteButton();
      }
    });

  }

}
