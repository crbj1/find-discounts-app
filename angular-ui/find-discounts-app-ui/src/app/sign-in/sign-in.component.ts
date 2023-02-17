import { Component } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';

import { IUser, CognitoService } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  loading: boolean;
  user: IUser;

  constructor(private router: Router, private cognitoService: CognitoService, private route: ActivatedRoute, private logger: Logger) {
    this.loading = false;
    this.user = {} as IUser;
  }

  public signIn(): void {
    this.loading = true;
    this.cognitoService.signIn(this.user)
    .then(() => {

      this.logger.log("Inside SignInComponent:SignIn Function: this.cognitoservice.signIn.then()");
      this.route.queryParams.subscribe(params => {

        if (params.returnUrl) {
          this.logger.log("Return URL");
          let urlTree: UrlTree = this.router.parseUrl(params.returnUrl);
          let thePathArray: any[] = [];
          for (let i = 0; i < urlTree.root.children.primary.segments.length; i++) {
            thePathArray.push(urlTree.root.children.primary.segments[i].path);
          }
          let the_params = urlTree.queryParams;

          this.router.navigate(thePathArray, { queryParams: the_params });
        } else {
          this.logger.log("No return URL");
          this.router.navigate(['/home']);
        }
      })
      
    }).catch((error) => {
      this.logger.log("Login failed");
      this.logger.log(error);
      this.loading = false;
    });
  }

}
