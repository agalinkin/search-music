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
      <div class="connect-card">
        <div class="spotify-logo">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>

        <h1>Connect Your Spotify Account</h1>
        <p class="description">
          To search and discover music, please connect your Spotify account. 
          This allows us to provide personalized music recommendations and access to millions of songs.
        </p>

        <button (click)="connectSpotify()" class="connect-button" [disabled]="isConnecting">
          <span *ngIf="!isConnecting">Connect with Spotify</span>
          <span *ngIf="isConnecting">Connecting...</span>
        </button>

        <button (click)="skipForNow()" class="skip-button">
          Skip for now
        </button>

        <p class="privacy-note">
          We'll never post anything without your permission
        </p>
      </div>
    </div>
  `,
  styles: [`
    .spotify-connect-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
      padding: 2rem;
    }

    .connect-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }

    .spotify-logo {
      margin-bottom: 2rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    h1 {
      font-size: 2rem;
      color: #191414;
      margin-bottom: 1rem;
    }

    .description {
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .connect-button {
      width: 100%;
      padding: 1rem;
      background: #1DB954;
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1rem;

      &:hover:not(:disabled) {
        background: #1ed760;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(29, 185, 84, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .skip-button {
      width: 100%;
      padding: 1rem;
      background: transparent;
      color: #666;
      border: 2px solid #e0e0e0;
      border-radius: 50px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;

      &:hover {
        border-color: #999;
        color: #191414;
      }
    }

    .privacy-note {
      font-size: 0.875rem;
      color: #999;
      margin: 0;
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
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
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