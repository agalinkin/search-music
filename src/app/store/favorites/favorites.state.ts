// store/favorites/favorites.state.ts
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Disc } from '../../models/disc.interface';
import { AddToFavorites, RemoveFromFavorites, ClearFavorites, LoadFavorites } from './favorites.actions';

export interface FavoritesStateModel {
  items: Disc[];
}

@State<FavoritesStateModel>({
  name: 'favorites',
  defaults: {
    items: []
  }
})
@Injectable()
export class FavoritesState {
  
  @Selector()
  static items(state: FavoritesStateModel): Disc[] {
    return state.items;
  }

  @Selector()
  static count(state: FavoritesStateModel): number {
    return state.items.length;
  }

  @Selector()
  static isInFavorites(state: FavoritesStateModel) {
    return (discId: string) => state.items.some(item => item.id === discId);
  }

  @Action(LoadFavorites)
  loadFavorites(ctx: StateContext<FavoritesStateModel>) {
    try {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        const items = JSON.parse(stored);
        ctx.patchState({ items });
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  @Action(AddToFavorites)
  addToFavorites(ctx: StateContext<FavoritesStateModel>, { disc }: AddToFavorites) {
    const state = ctx.getState();
    const alreadyExists = state.items.some(item => item.id === disc.id);
    
    if (!alreadyExists) {
      const newItems = [...state.items, disc];
      ctx.patchState({ items: newItems });
      this.saveTolocalStorage(newItems);
    }
  }

  @Action(RemoveFromFavorites)
  removeFromFavorites(ctx: StateContext<FavoritesStateModel>, { discId }: RemoveFromFavorites) {
    const state = ctx.getState();
    const newItems = state.items.filter(item => item.id !== discId);
    ctx.patchState({ items: newItems });
    this.saveTolocalStorage(newItems);
  }

  @Action(ClearFavorites)
  clearFavorites(ctx: StateContext<FavoritesStateModel>) {
    ctx.patchState({ items: [] });
    localStorage.removeItem('favorites');
  }

  private saveTolocalStorage(items: Disc[]): void {
    try {
      localStorage.setItem('favorites', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }
}