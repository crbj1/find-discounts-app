import { Routes, RouterModule } from "@angular/router";

import { ProfileComponent } from './profile/profile.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from "./home/home.component";

import { AuthGuard } from "./_helpers/auth.guard";

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'signIn', component: SignInComponent },
    { path: 'signUp', component: SignUpComponent },
    { path: '**', redirectTo: 'home' }
];

export const appRoutingModule = RouterModule.forRoot(routes);