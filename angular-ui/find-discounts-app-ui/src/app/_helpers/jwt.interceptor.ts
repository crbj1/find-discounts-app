import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { CognitoService } from '../_services/cognito.service';
import { Logger } from '../_services/logging.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private cognitoService: CognitoService, private logger: Logger) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    this.cognitoService.isAuthenticated()
    .then((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        this.cognitoService.getAccessToken()
        .then((token: string) => {
          //this.logger.log("Token: " + token);
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }).catch((reason: any) => {
          this.logger.error(reason);
        });
      }
    }).catch((reason: any) => {
      this.logger.error(reason);
    });
    
    return next.handle(request);
  }
}
