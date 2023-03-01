import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { throwError, catchError, retry, Observable } from 'rxjs';

import { Logger } from './logging.service';

import { environment } from 'src/environments/environment';

import { User } from '../_models/user';
import { Location } from '../_models/location';
import { LocationDatabaseScan } from '../_models/locationDatabaseScan';
import { UserDatabaseScan } from '../_models/userDatabaseScan';
import { GetUserResponse } from '../_models/getUserResponse';
import { GetLocationResponse } from '../_models/getLocationResponse';

@Injectable({ providedIn: 'root' })
export class RestService {

  constructor(private http: HttpClient, private logger: Logger) {

  }

  public getUsers(): Observable<UserDatabaseScan> {
    return this.http
    .get<UserDatabaseScan>(`${environment.API_INVOKE_URL}/user-register`)
    .pipe(retry(1), catchError(this.handleError));
  }

  public getUser(id: string): Observable<GetUserResponse> {
    return this.http
    .get<GetUserResponse>(`${environment.API_INVOKE_URL}/user-register/${id}`)
    .pipe(retry(1), catchError(this.handleError));
  }

  public createUser(user: User): Observable<User> {
    return this.http
    .post<User>(`${environment.API_INVOKE_URL}/user-register`, user)
    .pipe(retry(1), catchError(this.handleError));
  }

  public updateUser(user: User): Observable<User> {
    return this.http
    .put<User>(`${environment.API_INVOKE_URL}/user-register/${user.userId}`, user)
    .pipe(retry(1), catchError(this.handleError));
  }

  public deleteUser(id: string): Observable<string> {
    return this.http
    .delete<string>(`${environment.API_INVOKE_URL}/user-register/${id}`)
    .pipe(catchError(this.handleError));
  }

  public getLocations(): Observable<LocationDatabaseScan> {
    return this.http
    .get<LocationDatabaseScan>(`${environment.API_INVOKE_URL}/location`)
    .pipe(retry(1), catchError(this.handleError));
  }

  public getLocation(id: string): Observable<GetLocationResponse> {
    return this.http
    .get<GetLocationResponse>(`${environment.API_INVOKE_URL}/location/${id}`)
    .pipe(retry(1), catchError(this.handleError));
  }

  public createLocation(location: Location): Observable<Location> {
    return this.http
    .post<Location>(`${environment.API_INVOKE_URL}/location`, location)
    .pipe(retry(1), catchError(this.handleError));
  }

  public updateLocation(location: Location): Observable<Location> {
    return this.http
    .put<Location>(`${environment.API_INVOKE_URL}/location/${location.locationId}`, location)
    .pipe(retry(1), catchError(this.handleError));
  }

  public deleteLocation(id: string): Observable<string> {
    return this.http
    .delete<string>(`${environment.API_INVOKE_URL}/location/${id}`)
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
