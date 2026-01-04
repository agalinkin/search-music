// store/history/history.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { 
  LoadSearchHistory, 
  AddSearchHistory, 
  RemoveSearchHistory, 
  ClearSearchHistory 
} from './history.actions';

export interface SearchHistoryItem {
  query: string;
  resultsCount: number;
  timestamp: Date;
}

export interface HistoryStateModel {
  items: SearchHistoryItem[];
}

const STORAGE_KEY = 'search_history';

@State<HistoryStateModel>({
  name: 'history',
  defaults: { items: [] }
})
@Injectable()
export class HistoryState {
  
  @Selector()
  static items(state: HistoryStateModel) {
    return state.items;
  }

  @Selector()
  static count(state: HistoryStateModel) {
    return state.items.length;
  }
@Action(LoadSearchHistory)
loadSearchHistory(ctx: StateContext<HistoryStateModel>) {
  const currentState = ctx.getState();
  
  // Only load from localStorage if state is currently empty
  if (currentState.items.length > 0) {
    console.log('HistoryState: History already loaded, skipping');
    return;
  }
  
  console.log('HistoryState: Loading search history from localStorage');
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const items: SearchHistoryItem[] = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      const itemsWithDates = items.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      
      console.log('HistoryState: Loaded items:', itemsWithDates);
      ctx.patchState({ items: itemsWithDates });
    } else {
      console.log('HistoryState: No history found in localStorage');
    }
  } catch (error) {
    console.error('HistoryState: Error loading history:', error);
  }
}
  @Action(AddSearchHistory)
  addSearchHistory(ctx: StateContext<HistoryStateModel>, action: AddSearchHistory) {
    console.log('HistoryState: Adding search history:', action.query, action.resultsCount);
    
    const state = ctx.getState();
    const newItem: SearchHistoryItem = {
      query: action.query,
      resultsCount: action.resultsCount,
      timestamp: new Date()
    };

    // Remove duplicate if exists (same query)
    const filteredItems = state.items.filter(item => 
      item.query.toLowerCase() !== action.query.toLowerCase()
    );

    // Add new item at the beginning and keep only last 20
    const updatedItems = [newItem, ...filteredItems].slice(0, 20);

    ctx.patchState({ items: updatedItems });

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      console.log('HistoryState: Saved to localStorage');
    } catch (error) {
      console.error('HistoryState: Error saving to localStorage:', error);
    }
  }

  @Action(RemoveSearchHistory)
  removeSearchHistory(ctx: StateContext<HistoryStateModel>, action: RemoveSearchHistory) {
    console.log('HistoryState: Removing search history:', action.query);
    
    const state = ctx.getState();
    const updatedItems = state.items.filter(item => 
      item.query.toLowerCase() !== action.query.toLowerCase()
    );

    ctx.patchState({ items: updatedItems });

    // Update localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      console.log('HistoryState: Updated localStorage after removal');
    } catch (error) {
      console.error('HistoryState: Error updating localStorage:', error);
    }
  }

  @Action(ClearSearchHistory)
  clearSearchHistory(ctx: StateContext<HistoryStateModel>) {
    console.log('HistoryState: Clearing all search history');
    
    ctx.patchState({ items: [] });

    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('HistoryState: Cleared localStorage');
    } catch (error) {
      console.error('HistoryState: Error clearing localStorage:', error);
    }
  }
}