import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CognitoService } from './_services/cognito.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean;
  
  constructor(private router: Router, private cognitoService: CognitoService) {
    this.isAuthenticated = false;
  }

  public ngOnInit(): void {

    this.cognitoService.authenticationSubject
    .subscribe(val => {
      this.isAuthenticated = val;
    });
    
  }

  public signOut(): void {
    this.cognitoService.signOut()
    .then(() => {
      this.router.navigate(['/signIn']);
    });
  }
  
}
