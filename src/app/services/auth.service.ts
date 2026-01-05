// services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  username: string;
  spotifyConnected: boolean;
  spotifyToken?: string;
}
export interface User {
  id: string;
  email: string;
  name?: string;  // ← ADD THIS LINE
  spotifyConnected: boolean;
  spotifyUserId?: string;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  
  private readonly STORAGE_KEY = 'currentUser';
  private readonly SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // Замените на ваш
  private readonly REDIRECT_URI = 'http://localhost:4200/callback';

  constructor(private router: Router) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Получить текущего пользователя
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Проверка, залогинен ли пользователь
  get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Проверка, подключен ли Spotify
  get isSpotifyConnected(): boolean {
    return !!this.currentUserValue?.spotifyConnected;
  }

  // Регистрация
  register(email: string, username: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Имитация API запроса
      setTimeout(() => {
        const user: User = {
          id: this.generateId(),
          email,
          username,
          spotifyConnected: false
        };

        this.setUser(user);
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  // Логин
  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Имитация API запроса
      setTimeout(() => {
        // В реальном приложении здесь проверка на сервере
        const user: User = {
          id: this.generateId(),
          email,
          username: email.split('@')[0],
          spotifyConnected: false
        };

        this.setUser(user);
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  // Логаут
  logout(): void {
    this.clearUser();
    this.router.navigate(['/login']);
  }

  // Подключение к Spotify OAuth
  connectSpotify(): void {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'user-library-read'
    ];

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${this.SPOTIFY_CLIENT_ID}&` +
      `response_type=token&` +
      `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scopes.join(' '))}`;

    // Открыть окно авторизации Spotify
    window.location.href = authUrl;
  }

  // Обработка callback от Spotify
  handleSpotifyCallback(hash: string): void {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    
    if (accessToken && this.currentUserValue) {
      const updatedUser: User = {
        ...this.currentUserValue,
        spotifyConnected: true,
        spotifyToken: accessToken
      };
      
      this.setUser(updatedUser);
      this.router.navigate(['/search']);
    }
  }

  // Отключение Spotify
  disconnectSpotify(): void {
    if (this.currentUserValue) {
      const updatedUser: User = {
        ...this.currentUserValue,
        spotifyConnected: false,
        spotifyToken: undefined
      };
      
      this.setUser(updatedUser);
    }
  }

  // Получить Spotify токен
  getSpotifyToken(): string | null {
    return this.currentUserValue?.spotifyToken || null;
  }

  // Приватные методы
  private setUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearUser(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}