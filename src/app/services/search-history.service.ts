// services/search-history.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchHistoryService {
  private readonly STORAGE_KEY = 'music_search_history';
  private readonly MAX_HISTORY_ITEMS = 5;
  
  private historySubject = new BehaviorSubject<SearchHistoryItem[]>([]);
  public history$: Observable<SearchHistoryItem[]> = this.historySubject.asObservable();

  constructor() {
    this.loadHistory();
  }

  addSearch(query: string, resultsCount: number): void {
    if (!query.trim()) return;

    let history = this.getHistory();
    
    // Remove duplicate if exists
    history = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());
    
    // Add new search at the beginning
    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: new Date(),
      resultsCount
    };
    
    history.unshift(newItem);
    
    // Keep only last 5 items
    if (history.length > this.MAX_HISTORY_ITEMS) {
      history = history.slice(0, this.MAX_HISTORY_ITEMS);
    }
    
    this.saveHistory(history);
  }

  getHistory(): SearchHistoryItem[] {
    return this.historySubject.value;
  }

  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.historySubject.next([]);
  }

  removeHistoryItem(query: string): void {
    let history = this.getHistory();
    history = history.filter(item => item.query !== query);
    this.saveHistory(history);
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const history = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        this.historySubject.next(history);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      this.historySubject.next([]);
    }
  }

  private saveHistory(history: SearchHistoryItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      this.historySubject.next(history);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }
}