import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { IUser, CognitoService } from '../_services/cognito.service';
import { RestService } from '../_services/rest.service';
import { User } from '../_models/user';
import { Logger } from '../_services/logging.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signUpForm: FormGroup;
  loading: boolean;
  isConfirm: boolean;
  submitted1: boolean;
  error: string;

  user: IUser;
  restUser: User;

  //State names
  State: any = ['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CM', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TT', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY']

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private cognitoService: CognitoService, private restService: RestService, private logger: Logger) {
    this.loading = false;
    this.isConfirm = false;
    this.submitted1 = false;
    this.user = {} as IUser;
    this.restUser = {} as User;
  }

  ngOnInit(): void {
    this.signUpForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(35)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(35)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      dateOfBirth: ['', Validators.required],
      streetAddress1: ['', [Validators.maxLength(50)]],
      streetAddress2: ['', [Validators.maxLength(50)]],
      city: ['', [Validators.maxLength(50)]],
      state: ['', []],
      zipCode: ['', [Validators.minLength(5), Validators.maxLength(9)]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.signUpForm.controls; }

  public signUp(): void {
    this.submitted1 = true;

    if (this.signUpForm.invalid) {
      this.logger.log("Form is invalid");
      return;
    }

    this.loading = true;

    this.user.email = this.f.email.value;
    this.user.password = this.f.password.value;

    this.restUser.firstName = this.f.firstName.value;
    this.restUser.lastName = this.f.lastName.value;
    this.restUser.email = this.f.email.value;
    this.restUser.dateOfBirth = this.f.dateOfBirth.value;
    this.restUser.streetAddress1 = this.f.streetAddress1.value;
    this.restUser.streetAddress2 = this.f.streetAddress2.value;
    this.restUser.city = this.f.city.value;
    this.restUser.state = this.f.state.value;

    this.cognitoService.signUp(this.user)
    .then(() => {
      this.restService.createUser(this.restUser);
      this.loading = false;
      this.isConfirm = true;
    }).catch(() => {
      this.loading = false;
    });
  }

  public confirmSignUp(): void {
    this.loading = true;
    this.cognitoService.confirmSignUp(this.user)
    .then(() => {
      this.router.navigate(['/signIn']);
    }).catch(() => {
      this.loading = false;
    });
  }

}
