// components/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoggedIn = false;
  isSpotifyConnected = false;
  
  private authSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Подписываемся на изменения пользователя
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isSpotifyConnected = !!user?.spotifyConnected;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  connectSpotify(): void {
    this.authService.connectSpotify();
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}