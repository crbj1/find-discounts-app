import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { GetUserResponse } from '../_models/getUserResponse';
import { User } from '../_models/user';
import { CognitoService, IUser } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';
import { RestService } from '../_services/rest.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  updateProfileForm: FormGroup;
  loading: boolean;
  submitted: boolean;
  error = '';

  user: IUser;
  restUser: User;

  //State names
  State: any = ['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CM', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TT', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY'];

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private cognitoService: CognitoService, private restService: RestService, private logger: Logger) {
    this.loading = false;
    this.submitted = false;
    this.user = {} as IUser;
    this.restUser = {} as User;
  }

  ngOnInit(): void {

    this.cognitoService.getUser()
    .then((user: any) => {
      this.user = user.attributes;
      this.restService.getUser(this.user['custom:restId'])
      .pipe(take(1))
      .subscribe({
        next: (restResponse: GetUserResponse) => {
          this.restUser = restResponse.Item;
          this.logger.log("First name: " + this.restUser.firstName);
        },
        error: (err: any) => {
          this.logger.error(err);
        }
      });
    });

    this.updateProfileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(35)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(35)]],
      dateOfBirth: ['', Validators.required],
      streetAddress1: ['', [Validators.maxLength(50)]],
      streetAddress2: ['', [Validators.maxLength(50)]],
      city: ['', [Validators.maxLength(50)]],
      state: ['', []],
      zipCode: ['', [Validators.minLength(5), Validators.maxLength(9)]]
    });

  }

  get f() { return this.updateProfileForm.controls; }

  public updateUser() {
    this.submitted = true;

    if (this.updateProfileForm.invalid) {
      this.logger.log("Form is invalid");
      return;
    }

    this.loading = true;

    this.restUser.firstName = this.f.firstName.value;
    this.restUser.lastName = this.f.lastName.value;
    this.restUser.dateOfBirth = this.f.dateOfBirth.value;
    this.restUser.streetAddress1 = this.f.streetAddress1.value;
    this.restUser.streetAddress2 = this.f.streetAddress2.value;
    this.restUser.city = this.f.city.value;
    this.restUser.state = this.f.state.value;
    this.restUser.zipCode = this.f.zipCode.value;

    this.restService.updateUser(this.restUser)
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      },
      error: (err: any) => {
        this.logger.error(err);
        this.error = err;
        this.loading = false;
      }
    });
    
  }

}
