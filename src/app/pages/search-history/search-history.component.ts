// components/search-history/search-history.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HistoryState, SearchHistoryItem } from '../../store/history/history.state';
import { RemoveSearchHistory, ClearSearchHistory, LoadSearchHistory } from '../../store/history/history.actions';

@Component({
  selector: 'app-search-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search-history.component.html',
  styleUrls: ['./search-history.component.scss']
})
export class SearchHistoryComponent implements OnInit, OnDestroy {
  history$: Observable<SearchHistoryItem[]>;
  count$: Observable<number>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router
  ) {
    // Initialize observables using store.select()
    this.history$ = this.store.select(HistoryState.items);
    this.count$ = this.store.select(HistoryState.count);
  }

  ngOnInit(): void {
    console.log('SearchHistoryComponent: ngOnInit called');
    
    // Load history from localStorage
    this.store.dispatch(new LoadSearchHistory());
    
    // Debug: Subscribe to history to see updates
    this.history$.pipe(takeUntil(this.destroy$)).subscribe(history => {
      console.log('SearchHistoryComponent: History updated:', history);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onHistoryItemClick(item: SearchHistoryItem): void {
    console.log('SearchHistoryComponent: History item clicked:', item);
    this.router.navigate(['/search'], { 
      queryParams: { q: item.query } 
    });
  }

  removeHistoryItem(query: string, event: Event): void {
    event.stopPropagation();
    console.log('SearchHistoryComponent: Removing item:', query);
    this.store.dispatch(new RemoveSearchHistory(query));
  }

  clearAllHistory(): void {
    //if (confirm('Are you sure you want to clear all search history?')) {
      //console.log('SearchHistoryComponent: Clearing all history');
      this.store.dispatch(new ClearSearchHistory());
    //}
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  }
}