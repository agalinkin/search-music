// components/search/search.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MusicApiService } from '../../services/music-api.service';
import { SearchHistoryService, SearchHistoryItem } from '../../services/search-history.service';
import { Disc } from '../../models/disc.interface';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  searchResults: Disc[] = [];
  searchHistory: SearchHistoryItem[] = [];
  isLoading = false;
  hasSearched = false;
  
  private searchSubject = new Subject<string>();

  constructor(
    private musicApiService: MusicApiService,
    private searchHistoryService: SearchHistoryService,
    private router: Router,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to search history
    this.searchHistoryService.history$.subscribe(
      history => this.searchHistory = history
    );

    // Setup debounced search - уменьшена задержка до 500ms
    this.searchSubject.pipe(
      debounceTime(500),  // Было 300ms
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    console.log('Search input changed:', this.searchQuery);
    
    if (this.searchQuery.trim() && this.searchQuery.trim().length >= 3) {
      // Запускать поиск только если >= 3 символов
      this.searchSubject.next(this.searchQuery);
    } else if (this.searchQuery.trim().length < 3) {
      // Очистить результаты если меньше 3 символов
      this.searchResults = [];
      this.hasSearched = false;
    }
  }

  onSearchSubmit(): void {
    console.log('Search submitted:', this.searchQuery);
    if (this.searchQuery.trim()) {
      this.performSearch(this.searchQuery);
    }
  }

  private performSearch(query: string): void {
    console.log('Performing search for:', query);
    this.isLoading = true;
    this.hasSearched = true;
    this.cdr.detectChanges(); // Принудительное обновление UI
    
    this.musicApiService.searchDiscs(query).subscribe({
      next: (results) => {
        console.log('Search results received:', results);
        this.searchResults = results;
        this.isLoading = false;
        
        // Save to history
        this.searchHistoryService.addSearch(query, results.length);
        
        this.cdr.detectChanges(); // Принудительное обновление UI
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isLoading = false;
        this.searchResults = [];
        this.cdr.detectChanges(); // Принудительное обновление UI
      },
      complete: () => {
        console.log('Search completed');
        this.isLoading = false;
        this.cdr.detectChanges(); // Принудительное обновление UI
      }
    });
  }

  onHistoryItemClick(item: SearchHistoryItem): void {
    this.searchQuery = item.query;
    this.performSearch(item.query);
  }

  onDiscClick(disc: Disc): void {
    this.router.navigate(['/disc', disc.id]);
  }

  clearHistory(): void {
    this.searchHistoryService.clearHistory();
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  }
}