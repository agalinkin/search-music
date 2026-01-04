// store/search/search.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { MusicApiService } from '../../services/music-api.service';
import { PerformSearch, ClearSearch } from './search.actions';
import { Disc } from '../../models/disc.interface';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface SearchStateModel {
  results: Disc[];
  query: string;
  loading: boolean;
  hasSearched: boolean;
}

@State<SearchStateModel>({
  name: 'search',
  defaults: {
    results: [],
    query: '',
    loading: false,
    hasSearched: false
  }
})
@Injectable()
export class SearchState {
  constructor(private musicApi: MusicApiService) {}

  @Selector()
  static results(state: SearchStateModel) {
    return state.results;
  }

  @Selector()
  static loading(state: SearchStateModel) {
    return state.loading;
  }

  @Selector()
  static hasSearched(state: SearchStateModel) {
    return state.hasSearched;
  }

  @Selector()
  static query(state: SearchStateModel) {
    return state.query;
  }

  @Action(PerformSearch)
  performSearch(ctx: StateContext<SearchStateModel>, action: PerformSearch) {
    console.log('SearchState: performSearch action triggered for query:', action.query);
    
    const currentState = ctx.getState();
    if (currentState.loading && currentState.query === action.query) {
      console.log('SearchState: Search already in progress, skipping');
      return of(null);
    }

    ctx.patchState({ 
      loading: true,
      query: action.query,
      hasSearched: true
    });

    return this.musicApi.searchDiscs(action.query).pipe(
      tap((results) => {
        console.log('SearchState: Search results received:', results);
        ctx.patchState({ 
          results: results || [], 
          loading: false 
        });
      }),
      catchError((err) => {
        console.error('SearchState: Search error:', err);
        ctx.patchState({ 
          results: [], 
          loading: false 
        });
        return of([]);
      })
    );
  }

  @Action(ClearSearch)
  clearSearch(ctx: StateContext<SearchStateModel>) {
    console.log('SearchState: clearSearch action triggered');
    ctx.patchState({
      results: [],
      query: '',
      hasSearched: false,
      loading: false
    });
  }
}