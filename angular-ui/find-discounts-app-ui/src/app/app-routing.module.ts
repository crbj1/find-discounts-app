import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";
import { AddLocationComponent } from "./add-location/add-location.component";
import { DeleteMarkerComponent } from "./delete-marker/delete-marker.component";
import { EditMarkerComponent } from "./edit-marker/edit-marker.component";
import { EditProfileComponent } from "./edit-profile/edit-profile.component";
import { HomeComponent } from "./home/home.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { ProfileComponent } from "./profile/profile.component";
import { SignInComponent } from "./sign-in/sign-in.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { AuthGuard } from "./_helpers/auth.guard";
import { LocationGuard } from "./_helpers/location.guard";

const routes: Routes = [
    { 
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard],
        canActivateChild: [LocationGuard],
        children: [
            {
                path: 'edit/:id',
                component: EditMarkerComponent
            },
            {
                path: 'delete/:id',
                component: DeleteMarkerComponent
            }
        ]
    },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'editProfile', component: EditProfileComponent, canActivate: [AuthGuard]},
    { path: 'signIn', component: SignInComponent },
    { path: 'signUp', component: SignUpComponent },
    { path: 'addLocation', component: AddLocationComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    imports: [BrowserModule, RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class RoutingModule {}