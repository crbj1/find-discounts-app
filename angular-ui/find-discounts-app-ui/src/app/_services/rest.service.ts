import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { throwError, catchError, retry, Observable } from 'rxjs';

import { Logger } from './logging.service';

import { environment } from 'src/environments/environment';

import { User } from '../_models/user';
import { Location } from '../_models/location';

@Injectable({ providedIn: 'root' })
export class RestService {

  constructor(private http: HttpClient, private logger: Logger) {

  }

  public getUsers(): Observable<User[]> {
    return this.http
    .get<User[]>(`${environment.API_INVOKE_URL}/user-register`)
    .pipe(retry(1), catchError(this.handleError));
  }

  public getUser(id: number): Observable<User> {
    return this.http
    .get<User>(`${environment.API_INVOKE_URL}/user-register/${id}`)
    .pipe(retry(1), catchError(this.handleError));
  }

  public createUser(user: User): Observable<User> {
    return this.http
    .post<User>(`${environment.API_INVOKE_URL}/user-register`, user)
    .pipe(retry(1), catchError(this.handleError));
  }

  public getLocations(): Observable<Location[]> {
    return this.http
    .get<Location[]>(`${environment.API_INVOKE_URL}/location`)
    .pipe(retry(1), catchError(this.handleError));
  }

  public getLocation(id: number): Observable<Location> {
    return this.http
    .get<Location>(`${environment.API_INVOKE_URL}/location/${id}`)
    .pipe(retry(1), catchError(this.handleError));
  }

  public createLocation(location: Location): Observable<Location> {
    return this.http
    .post<Location>(`${environment.API_INVOKE_URL}/location`, location)
    .pipe(retry(1), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred.
      this.logger.error('An error occurred: ', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      this.logger.error(
        `Backend returned code ${error.status}, body was `, error.error
      );
    }
    // Return an observable with a user-facing error message
    return throwError(() => new Error('Something bad happened; please try again later.'));

  }

}
