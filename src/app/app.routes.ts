// app.routes.ts или app-routing.module.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
import { SpotifyConnectComponent } from './pages/spotify-connect/spotify-connect.component';
import { SearchComponent } from './pages/search/search.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { DiscDetailComponent } from './pages/disc-detail/disc-detail.component';
import { SearchHistoryComponent } from './pages/search-history/search-history.component';

export const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: UserRegistrationComponent },
  { path: 'spotify-connect', component: SpotifyConnectComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent },
  { path: 'favorites', component: FavoritesComponent, canActivate: [AuthGuard] },
  { path: 'history', component: SearchHistoryComponent, canActivate: [AuthGuard] },
  { path: 'disc/:id', component: DiscDetailComponent },
  { path: '**', redirectTo: '/search' }
];