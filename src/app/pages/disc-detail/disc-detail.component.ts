// components/disc-detail/disc-detail.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicApiService } from '../../services/music-api.service';
import { Disc } from '../../models/disc.interface';

@Component({
  selector: 'app-disc-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disc-detail.component.html',
  styleUrl: './disc-detail.component.scss'
})
export class DiscDetailComponent implements OnInit {
  disc: Disc | null = null;
  isLoading = true;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private musicApiService: MusicApiService,
    public cdr: ChangeDetectorRef  // Изменено на public
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

  private loadDiscDetails(id: string): void {
    console.log('Loading disc details for ID:', id);
    console.log('isLoading before:', this.isLoading);
    this.isLoading = true;
    this.cdr.detectChanges(); // Принудительно обновляем UI
    
    this.musicApiService.getDiscById(id).subscribe({
      next: (disc) => {
        console.log('Received disc in component:', disc);
        console.log('Disc is truthy?', !!disc);
        if (disc) {
          this.disc = disc;
          this.notFound = false;
          console.log('this.disc set to:', this.disc);
          console.log('this.notFound:', this.notFound);
        } else {
          console.warn('Disc is null or undefined');
          this.notFound = true;
        }
        this.isLoading = false;
        console.log('isLoading after:', this.isLoading);
        this.cdr.detectChanges(); // Принудительно обновляем UI
      },
      error: (error) => {
        console.error('Error loading disc details:', error);
        this.notFound = true;
        this.isLoading = false;
        this.cdr.detectChanges(); // Принудительно обновляем UI
      }
    });
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
      // Открыть альбом в Spotify
      const spotifyUrl = `https://open.spotify.com/album/${this.disc.id}`;
      window.open(spotifyUrl, '_blank');
    }
  }

  addToFavorites(): void {
    if (this.disc) {
      // Сохранить в localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      // Проверить, не добавлен ли уже
      const alreadyExists = favorites.some((fav: Disc) => fav.id === this.disc!.id);
      
      if (!alreadyExists) {
        favorites.push(this.disc);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Added to favorites!');
      } else {
        alert('Already in favorites!');
      }
    }
  }
}