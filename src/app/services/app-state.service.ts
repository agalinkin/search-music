// services/app-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Disc } from '../models/disc.interface';

export interface AppState {
  searchResults: Disc[];
  currentQuery: string;
  isSearching: boolean;
  selectedDisc: Disc | null;
  favorites: Disc[];
  recentSearches: string[];
}

const initialState: AppState = {
  searchResults: [],
  currentQuery: '',
  isSearching: false,
  selectedDisc: null,
  favorites: [],
  recentSearches: []
};

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private stateSubject = new BehaviorSubject<AppState>(initialState);
  public state$: Observable<AppState> = this.stateSubject.asObservable();

  constructor() {
    // Загрузить избранное из localStorage при инициализации
    this.loadFavoritesFromStorage();
  }

  // Получить текущее состояние
  getState(): AppState {
    return this.stateSubject.value;
  }

  // Обновить часть состояния
  private updateState(partialState: Partial<AppState>): void {
    const currentState = this.getState();
    const newState = { ...currentState, ...partialState };
    this.stateSubject.next(newState);
  }

  // === SEARCH RESULTS ===
  setSearchResults(results: Disc[], query: string): void {
    this.updateState({
      searchResults: results,
      currentQuery: query,
      isSearching: false
    });
  }

  clearSearchResults(): void {
    this.updateState({
      searchResults: [],
      currentQuery: '',
      isSearching: false
    });
  }

  setSearching(isSearching: boolean): void {
    this.updateState({ isSearching });
  }

  getSearchResults(): Disc[] {
    return this.getState().searchResults;
  }

  getCurrentQuery(): string {
    return this.getState().currentQuery;
  }

  // === SELECTED DISC ===
  setSelectedDisc(disc: Disc | null): void {
    this.updateState({ selectedDisc: disc });
  }

  getSelectedDisc(): Disc | null {
    return this.getState().selectedDisc;
  }

  // === FAVORITES ===
  addToFavorites(disc: Disc): boolean {
    const currentFavorites = this.getState().favorites;
    
    // Проверить, не добавлен ли уже
    const alreadyExists = currentFavorites.some(fav => fav.id === disc.id);
    
    if (!alreadyExists) {
      const newFavorites = [...currentFavorites, disc];
      this.updateState({ favorites: newFavorites });
      this.saveFavoritesToStorage(newFavorites);
      return true;
    }
    
    return false;
  }

  removeFromFavorites(discId: string): void {
    const currentFavorites = this.getState().favorites;
    const newFavorites = currentFavorites.filter(fav => fav.id !== discId);
    this.updateState({ favorites: newFavorites });
    this.saveFavoritesToStorage(newFavorites);
  }

  isInFavorites(discId: string): boolean {
    return this.getState().favorites.some(fav => fav.id === discId);
  }

  getFavorites(): Disc[] {
    return this.getState().favorites;
  }

  clearFavorites(): void {
    this.updateState({ favorites: [] });
    localStorage.removeItem('favorites');
  }

  private saveFavoritesToStorage(favorites: Disc[]): void {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  private loadFavoritesFromStorage(): void {
    try {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        const favorites = JSON.parse(stored);
        this.updateState({ favorites });
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }

  // === RECENT SEARCHES ===
  addRecentSearch(query: string): void {
    const currentSearches = this.getState().recentSearches;
    
    // Удалить дубликаты
    const filtered = currentSearches.filter(s => s.toLowerCase() !== query.toLowerCase());
    
    // Добавить в начало
    const newSearches = [query, ...filtered].slice(0, 5); // Максимум 5
    
    this.updateState({ recentSearches: newSearches });
  }

  getRecentSearches(): string[] {
    return this.getState().recentSearches;
  }

  clearRecentSearches(): void {
    this.updateState({ recentSearches: [] });
  }

  // === UTILITY ===
  resetState(): void {
    this.stateSubject.next(initialState);
    localStorage.removeItem('favorites');
  }

  // Observable для отдельных частей состояния
  get searchResults$(): Observable<Disc[]> {
    return new Observable(observer => {
      this.state$.subscribe(state => observer.next(state.searchResults));
    });
  }

  get favorites$(): Observable<Disc[]> {
    return new Observable(observer => {
      this.state$.subscribe(state => observer.next(state.favorites));
    });
  }

  get isSearching$(): Observable<boolean> {
    return new Observable(observer => {
      this.state$.subscribe(state => observer.next(state.isSearching));
    });
  }

  get selectedDisc$(): Observable<Disc | null> {
    return new Observable(observer => {
      this.state$.subscribe(state => observer.next(state.selectedDisc));
    });
  }
}