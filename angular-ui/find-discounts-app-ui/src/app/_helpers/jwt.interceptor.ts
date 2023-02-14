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
    const isAuthenticated = this.cognitoService.isAuthenticated();
    if (isAuthenticated) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.cognitoService.getAccessToken}`
        }
      });
    }
    
    return next.handle(request);
  }
}
