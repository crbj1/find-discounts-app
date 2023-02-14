import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CognitoService } from '../_services/cognito.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private cognitoService: CognitoService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        this.cognitoService.signOut();
        location.reload();
      }

      const error = err.error.message || err.statusText;
      return throwError(() => new Error(error));
    }));
  }
}
