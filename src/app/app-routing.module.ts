// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { DiscDetailComponent } from './pages/disc-detail/disc-detail.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';


export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: SearchComponent },
  { path: 'disc/:id', component: DiscDetailComponent }, 
  { path: 'register', component: UserRegistrationComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({ 
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


