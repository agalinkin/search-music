import { Routes } from '@angular/router';
import { SearchComponent } from './pages/search/search.component';
import { SearchHistoryComponent } from './pages/search-history/search-history.component';
import { DiscDetailComponent } from './pages/disc-detail/disc-detail.component';
import { UserRegistrationComponent } from './pages/user-registration/user-registration.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';

export const routes: Routes = [
  { path: '', component: SearchComponent },
  { path: 'history', component: SearchHistoryComponent },
  { path: 'disc/:id', component: DiscDetailComponent },
  { path: 'register', component: UserRegistrationComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: '**', redirectTo: '' }
];