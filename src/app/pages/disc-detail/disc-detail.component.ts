// components/disc-detail/disc-detail.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MusicApiService } from '../../services/music-api.service';
import { Disc } from '../../models/disc.interface';
import { FavoritesState } from '../../store/favorites/favorites.state';
import { AddToFavorites, RemoveFromFavorites } from '../../store/favorites/favorites.actions';

@Component({
  selector: 'app-disc-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disc-detail.component.html',
  styleUrl: './disc-detail.component.scss'
})
export class DiscDetailComponent implements OnInit, OnDestroy {
  disc: Disc | null = null;
  isLoading = true;
  notFound = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private musicApiService: MusicApiService,
    private store: Store,
    public cdr: ChangeDetectorRef
  ) {
    console.log('DiscDetailComponent constructor called');
  }

  ngOnInit(): void {
    console.log('DiscDetailComponent ngOnInit called');
    const discId = this.route.snapshot.paramMap.get('id');
    console.log('Disc ID from route:', discId);
    
    if (discId) {
      this.loadDiscDetails(discId);
    } else {
      console.error('No disc ID provided');
      this.notFound = true;
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDiscDetails(id: string): void {
    console.log('Loading disc details for ID:', id);
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.musicApiService.getDiscById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (disc) => {
        console.log('Received disc in component:', disc);
        if (disc) {
          this.disc = disc;
          this.notFound = false;
          console.log('Disc loaded:', this.disc.name);
          console.log('Is in favorites?', this.isInFavorites);
        } else {
          console.warn('Disc is null or undefined');
          this.notFound = true;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading disc details:', error);
        this.notFound = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Check if current disc is in favorites
  get isInFavorites(): boolean {
    if (!this.disc) return false;
    const isFav = this.store.selectSnapshot(FavoritesState.isInFavorites)(this.disc.id);
    return isFav;
  }

  // Toggle favorite status
  toggleFavorite(): void {
    if (!this.disc) {
      console.error('DiscDetailComponent: No disc available to favorite');
      return;
    }

    if (this.isInFavorites) {
      console.log('DiscDetailComponent: Removing from favorites:', this.disc.name);
      this.store.dispatch(new RemoveFromFavorites(this.disc.id));
    } else {
      console.log('DiscDetailComponent: Adding to favorites:', this.disc);
      this.store.dispatch(new AddToFavorites(this.disc));
    }
    
    // Force UI update
    this.cdr.detectChanges();
  }

  // Legacy methods (keep for backward compatibility if needed)
  addToFavorites(): void {
    if (!this.disc) return;
    console.log('DiscDetailComponent: addToFavorites called');
    this.store.dispatch(new AddToFavorites(this.disc));
    this.cdr.detectChanges();
  }

  removeFromFavorites(): void {
    if (!this.disc) return;
    console.log('DiscDetailComponent: removeFromFavorites called');
    this.store.dispatch(new RemoveFromFavorites(this.disc.id));
    this.cdr.detectChanges();
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  }

  playAlbum(): void {
    if (this.disc && this.disc.id) {
      const spotifyUrl = `https://open.spotify.com/album/${this.disc.id}`;
      window.open(spotifyUrl, '_blank');
    }
  }
}