// pages/favorites/favorites.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FavoritesState } from '../../store/favorites/favorites.state';
import { RemoveFromFavorites, ClearFavorites } from '../../store/favorites/favorites.actions';
import { Disc } from '../../models/disc.interface';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['../search/search.component.scss','../search-history/search-history.component.scss', '../../../styles.scss']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites$: Observable<Disc[]>;
  count$: Observable<number>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.favorites$ = this.store.select(FavoritesState.items);
    this.count$ = this.store.select(FavoritesState.count);
  }

  ngOnInit(): void {
    console.log('FavoritesComponent: ngOnInit called');
    
    // Debug: Subscribe to favorites to see updates
    this.favorites$.pipe(takeUntil(this.destroy$)).subscribe(favorites => {
      console.log('FavoritesComponent: Favorites updated:', favorites);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDiscClick(disc: Disc): void {
    console.log('FavoritesComponent: Disc clicked:', disc);
    this.router.navigate(['/disc', disc.id]);
  }

  removeFromFavorites(discId: string, event: Event): void {
    event.stopPropagation();
    console.log('FavoritesComponent: Removing from favorites:', discId);
    this.store.dispatch(new RemoveFromFavorites(discId));
  }

  clearAllFavorites(): void {
    //if (confirm('Are you sure you want to remove all favorites?')) {
     // console.log('FavoritesComponent: Clearing all favorites');
      this.store.dispatch(new ClearFavorites());
    //}
  }
}