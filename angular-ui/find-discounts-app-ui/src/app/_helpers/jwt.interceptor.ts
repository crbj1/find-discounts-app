import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { CognitoService } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private cognitoService: CognitoService, private logger: Logger) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return from(this.cognitoService.getCurrentSession())
    .pipe(
      switchMap((auth: any) => {
        let jwt = auth.accessToken.jwtToken;
        let with_auth_request = request.clone({
          setHeaders: {
            Authorization: jwt
          }
        });
        this.logger.log("Cloned", with_auth_request);
        return next.handle(with_auth_request);
      }),
      catchError((err) => {
        this.logger.log("Error ", err);
        return next.handle(request);
      })
    );
    
    // this.cognitoService.isAuthenticated()
    // .then((isAuthenticated: boolean) => {
    //   if (isAuthenticated) {
    //     this.cognitoService.getAccessToken()
    //     .then((token: string) => {
    //       this.logger.log("Token: " + token);
    //       request = request.clone({
    //         setHeaders: {
    //           Authorization: token
    //         }
    //       });
    //     }).catch((reason: any) => {
    //       this.logger.error(reason);
    //     });
    //   }
    // }).catch((reason: any) => {
    //   this.logger.error(reason);
    // });
    
    // return next.handle(request);

  }

}
