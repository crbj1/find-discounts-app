import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Amplify, Auth } from 'aws-amplify';

import { environment } from 'src/environments/environment';
import { Logger } from './logging.service';

export interface IUser {
  email: string;
  password: string;
  showPassword: boolean;
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CognitoService {

  public authenticationSubject: BehaviorSubject<any>;

  constructor(private logger: Logger) {
    Amplify.configure({
      Auth: environment.cognito
    });

    this.authenticationSubject = new BehaviorSubject<boolean>(false);
  }

  public signUp(user: IUser): Promise<any> {
    this.logger.log("Inside CognitoService:SignUp Function");
    return Auth.signUp({
      username: user.email,
      password: user.password,
      attributes: {
        email: user.email
      }
    });
  }

  public confirmSignUp(user: IUser): Promise<any> {
    return Auth.confirmSignUp(user.email, user.code);
  }

  public signIn(user: IUser): Promise<any> {
    this.logger.log("Inside CognitoService:SignIn Function");
    return Auth.signIn(user.email, user.password)
    .then(() => {
      this.logger.log("Sign In Succeeded");
      this.authenticationSubject.next(true);
    });
  }

  public signOut(): Promise<any> {
    return Auth.signOut({ global: true })
    .then(() => {
      this.authenticationSubject.next(false);
    });
  }

  public isAuthenticated(): Promise<boolean> {
    if (this.authenticationSubject.value) {
      return Promise.resolve(true);
    } else {
      return this.getUser()
      .then((user: any) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      }).catch(() => {
        return false;
      });
    }
  }

  public getUser(): Promise<any> {
    return Auth.currentUserInfo();
  }

  public updateUser(user: IUser): Promise<any> {
    return Auth.currentUserPoolUser()
    .then((cognitoUser: any) => {
      return Auth.updateUserAttributes(cognitoUser, user);
    });
  }

  public async getAccessToken(): Promise<string> {
    return (await Auth.currentSession()).getAccessToken().getJwtToken();
  }

  public getCurrentSession() {
    return Auth.currentSession();
  }
  
}
