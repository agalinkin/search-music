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
  take,
  debounceTime
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
  readonly AUTOCOMPLETE_LENGTH: number = 5; // Autocomplete triggers at 5 characters

  // Autocomplete properties
  showAutocomplete: boolean = false;
  autocompleteResults: Disc[] = [];
  selectedAutocompleteIndex: number = -1;

  private destroy$ = new Subject<void>();
  private searchPerformed = false;
  private searchInput$ = new Subject<string>();

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
    
    // Load search history once
    this.store.dispatch(new LoadSearchHistory());

    // Setup autocomplete with debounce
    this.searchInput$.pipe(
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.handleAutocomplete(query);
    });

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

    // Subscribe to search results to add to history and populate autocomplete
    this.searchResults$.pipe(
      distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      }),
      filter(results => results && results.length > 0),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      console.log('SearchComponent: Results received:', results.length, 'items');
      
      const trimmedQuery = this.searchQuery.trim();
      if (trimmedQuery && results.length > 0) {
        console.log('SearchComponent: Dispatching AddSearchHistory for:', trimmedQuery, results.length);
        this.store.dispatch(new AddSearchHistory(trimmedQuery, results.length));
        
        // Update autocomplete results if showing
        if (this.showAutocomplete && trimmedQuery.length >= this.AUTOCOMPLETE_LENGTH) {
          this.autocompleteResults = results.slice(0, 5); // Show top 5 results
        }
      }
    });

    // Debug subscriptions
    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      console.log('SearchComponent: Loading state:', loading);
    });

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
      this.showAutocomplete = false;
    } else {
      this.showMinLengthHint = false;
      
      if (trimmed.length === 0) {
        console.log('SearchComponent: Clearing search');
        this.store.dispatch(new ClearSearch());
        this.showAutocomplete = false;
        this.autocompleteResults = [];
      } else if (trimmed.length >= this.AUTOCOMPLETE_LENGTH) {
        // Trigger autocomplete
        this.searchInput$.next(trimmed);
      } else {
        this.showAutocomplete = false;
      }
    }
    
    this.selectedAutocompleteIndex = -1;
  }

  private handleAutocomplete(query: string): void {
    if (query.length >= this.AUTOCOMPLETE_LENGTH) {
      console.log('SearchComponent: Triggering autocomplete for:', query);
      
      // Perform search for autocomplete
      this.store.dispatch(new PerformSearch(query));
      this.showAutocomplete = true;
      
      // Get current results for autocomplete
      this.searchResults$.pipe(take(1)).subscribe(results => {
        this.autocompleteResults = results.slice(0, 5); // Top 5 suggestions
        this.cdr.detectChanges();
      });
    }
  }

  onSearchSubmit(): void {
    const trimmed = this.searchQuery.trim();
    console.log('SearchComponent: Search submitted:', trimmed);
    
    if (trimmed.length >= this.MIN_SEARCH_LENGTH) {
      this.showAutocomplete = false;
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
    this.showAutocomplete = false;
    // Navigate to disc detail page
    this.router.navigate(['/disc', disc.id]);
  }

  onAutocompleteSelect(disc: Disc): void {
    console.log('SearchComponent: Autocomplete item selected:', disc);
    this.searchQuery = disc.name;
    this.showAutocomplete = false;
    this.performSearch(disc.name);
  }

  onHistoryItemClick(item: any): void {
    console.log('SearchComponent: History item clicked:', item);
    this.searchQuery = item.query;
    this.showAutocomplete = false;
    this.performSearch(item.query);
  }

  // Keyboard navigation for autocomplete
  onSearchKeydown(event: KeyboardEvent): void {
    if (!this.showAutocomplete || this.autocompleteResults.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedAutocompleteIndex = Math.min(
          this.selectedAutocompleteIndex + 1,
          this.autocompleteResults.length - 1
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        this.selectedAutocompleteIndex = Math.max(
          this.selectedAutocompleteIndex - 1,
          -1
        );
        break;
      
      case 'Enter':
        event.preventDefault();
        if (this.selectedAutocompleteIndex >= 0) {
          const selected = this.autocompleteResults[this.selectedAutocompleteIndex];
          this.onAutocompleteSelect(selected);
        } else {
          this.onSearchSubmit();
        }
        break;
      
      case 'Escape':
        this.showAutocomplete = false;
        this.selectedAutocompleteIndex = -1;
        break;
    }
  }

  // Close autocomplete when clicking outside
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-box')) {
      this.showAutocomplete = false;
      this.selectedAutocompleteIndex = -1;
    }
  }
}