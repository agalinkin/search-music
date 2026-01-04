import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { 
  distinctUntilChanged, 
  takeUntil,
  filter,
  take
} from 'rxjs/operators';

import { SearchState } from '../../store/search/search.state';
import { PerformSearch, ClearSearch } from '../../store/search/search.actions';
import { AddSearchHistory, LoadSearchHistory } from '../../store/history/history.actions';
import { HistoryState } from '../../store/history/history.state';
import { Disc } from '../../models/disc.interface';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  // Use store.select() instead of @Select decorator
  searchResults$: Observable<Disc[]>;
  isLoading$: Observable<boolean>;
  hasSearched$: Observable<boolean>;
  searchHistory$: Observable<any[]>;

  searchQuery: string = '';
  showMinLengthHint: boolean = false;
  readonly MIN_SEARCH_LENGTH: number = 2;

  private destroy$ = new Subject<void>();
  private searchPerformed = false;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize observables in constructor using store.select()
    this.searchResults$ = this.store.select(SearchState.results);
    this.isLoading$ = this.store.select(SearchState.loading);
    this.hasSearched$ = this.store.select(SearchState.hasSearched);
    this.searchHistory$ = this.store.select(HistoryState.items);
    
    console.log('SearchComponent: Observables initialized', {
      searchResults$: !!this.searchResults$,
      isLoading$: !!this.isLoading$,
      hasSearched$: !!this.hasSearched$,
      searchHistory$: !!this.searchHistory$
    });
  }

ngOnInit(): void {
  console.log('SearchComponent: ngOnInit called');
  
  // Initialize observables check
  console.log('SearchComponent: Observables initialized', {
    searchResults$: !!this.searchResults$,
    isLoading$: !!this.isLoading$,
    hasSearched$: !!this.hasSearched$,
    searchHistory$: !!this.searchHistory$
  });
  
  // Load search history once
  this.store.dispatch(new LoadSearchHistory());

  // Handle query params from URL - ONLY ONCE
  this.route.queryParams.pipe(
    take(1),
    filter(params => !!params['q'])
  ).subscribe(params => {
    console.log('SearchComponent: URL params received:', params);
    const q = params['q'];
    if (q && !this.searchPerformed) {
      this.searchQuery = q;
      this.performSearch(q);
      this.searchPerformed = true;
    }
  });

  // Subscribe to search results to add to history
  // FIXED: Remove skip(1) and use proper filtering
  this.searchResults$.pipe(
    distinctUntilChanged((prev, curr) => {
      return JSON.stringify(prev) === JSON.stringify(curr);
    }),
    filter(results => results && results.length > 0),
    takeUntil(this.destroy$)
  ).subscribe(results => {
    console.log('SearchComponent: Results received for history:', results.length, 'items');
    
    const trimmedQuery = this.searchQuery.trim();
    if (trimmedQuery && results.length > 0) {
      console.log('SearchComponent: Dispatching AddSearchHistory for:', trimmedQuery, results.length);
      this.store.dispatch(new AddSearchHistory(trimmedQuery, results.length));
    }
  });

  // Debug: Subscribe to loading state
  this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
    console.log('SearchComponent: Loading state:', loading);
  });

  // Debug: Subscribe to hasSearched state
  this.hasSearched$.pipe(takeUntil(this.destroy$)).subscribe(hasSearched => {
    console.log('SearchComponent: HasSearched state:', hasSearched);
  });
}

  ngOnDestroy(): void {
    console.log('SearchComponent: ngOnDestroy called');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    const trimmed = this.searchQuery.trim();

    console.log('SearchComponent: Search input changed:', trimmed);

    if (trimmed.length > 0 && trimmed.length < this.MIN_SEARCH_LENGTH) {
      this.showMinLengthHint = true;
    } else {
      this.showMinLengthHint = false;
      if (trimmed.length === 0) {
        console.log('SearchComponent: Clearing search');
        this.store.dispatch(new ClearSearch());
      }
    }
  }

  onSearchSubmit(): void {
    const trimmed = this.searchQuery.trim();
    console.log('SearchComponent: Search submitted:', trimmed);
    
    if (trimmed.length >= this.MIN_SEARCH_LENGTH) {
      this.performSearch(trimmed);
    }
  }

  private performSearch(query: string): void {
    console.log('SearchComponent: Performing search for:', query);
    
    // Dispatch the search action
    this.store.dispatch(new PerformSearch(query));
    
    // Update URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query },
      queryParamsHandling: 'merge'
    });
    
    this.searchPerformed = true;
  }

  onDiscClick(disc: any): void {
    console.log('SearchComponent: Disc clicked:', disc);
    // Navigate to disc detail page
    this.router.navigate(['/disc', disc.id]);
  }

  onHistoryItemClick(item: any): void {
    console.log('SearchComponent: History item clicked:', item);
    this.searchQuery = item.query;
    this.performSearch(item.query);
  }
}