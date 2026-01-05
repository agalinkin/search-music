// app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { LoadSearchHistory } from './store/history/history.actions';
import { LoadFavorites } from './store/favorites/favorites.actions';
import { HeaderComponent } from "./pages/header/header.component";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet], // Add RouterOutlet here  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: '../styles.scss'
})
export class AppComponent implements OnInit {
  title = 'search-music';

  constructor(private store: Store, private authService: AuthService) {}

  ngOnInit(): void {
    console.log('AppComponent: Initializing app');
    
    // Load persisted data from localStorage
    this.store.dispatch(new LoadSearchHistory());
    this.store.dispatch(new LoadFavorites());
  }
   get isLoggedIn() { return this.authService.isLoggedIn; }
  get isSpotifyConnected() { return this.authService.isSpotifyConnected; }
  get currentUser() { return this.authService.currentUserValue; }



  connectSpotify() {
    this.authService.connectSpotify();
  }

  logout() {
    this.authService.logout();
  }
}