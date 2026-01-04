// app.config.ts (для standalone приложения)
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { SearchState } from './store/search/search.state';
import { FavoritesState } from './store/favorites/favorites.state';
import { HistoryState } from './store/history/history.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideStore([SearchState, FavoritesState, HistoryState])
  ]
};
