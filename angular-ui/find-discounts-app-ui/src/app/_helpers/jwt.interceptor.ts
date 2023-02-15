import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { CognitoService } from '../_services/cognito.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private cognitoService: CognitoService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    this.cognitoService.isAuthenticated()
    .then((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        this.cognitoService.getAccessToken()
        .then((token: string) => {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        });
      }
    });
    
    return next.handle(request);
  }
}
