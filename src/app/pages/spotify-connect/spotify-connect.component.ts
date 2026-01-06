// pages/spotify-connect/spotify-connect.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-spotify-connect',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="spotify-connect-container">
      <div class="spotify-connect-card">
        <div class="spotify-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        
        <h1>Connect Your Spotify Account</h1>
        <p class="description">
          To search and discover music, please connect your Spotify account.
          This allows us to provide personalized music recommendations and
          access to millions of songs.
        </p>

        <div class="buttons">
          <button class="btn-spotify" (click)="connectSpotify()" [disabled]="isConnecting">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span *ngIf="!isConnecting">Connect with Spotify</span>
            <span *ngIf="isConnecting">Connecting...</span>
          </button>

          <button class="btn-skip" (click)="skipForNow()">
            Skip for now
          </button>
        </div>

        <p class="privacy-note">
          We'll never post anything without your permission
        </p>
      </div>
    </div>
  `,
  styles: [`
    .spotify-connect-container {
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
    }

    .spotify-connect-card {
      background: white;
      border-radius: 16px;
      padding: 3rem 2rem;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .spotify-icon {
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .description {
      color: #666;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .btn-spotify {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      background: #1DB954;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);

      &:hover:not(:disabled) {
        background: #1ed760;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(29, 185, 84, 0.4);
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }
    }

    .btn-skip {
      background: transparent;
      color: #666;
      border: 2px solid #e0e0e0;
      padding: 1rem 2rem;
      border-radius: 50px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #1a1a2e;
        color: #1a1a2e;
      }
    }

    .privacy-note {
      color: #999;
      font-size: 0.875rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .spotify-connect-container {
        padding: 1rem;
      }

      .spotify-connect-card {
        padding: 2rem 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class SpotifyConnectComponent implements OnInit {
  isConnecting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if already connected
    if (this.authService.isSpotifyConnected) {
      this.router.navigate(['/search']);
    }
  }

  connectSpotify(): void {
    this.isConnecting = true;
    this.authService.connectSpotify();
  }

  skipForNow(): void {
    this.router.navigate(['/search']);
  }
}