// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

// Update this path to match your environment file location
// import { environment } from '../../environments/environment';
// OR if you don't have environment file yet:
const API_URL = 'http://localhost:3000/api'; // Change this to your backend URL

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;  // Added username field
  spotifyConnected: boolean;
  spotifyUserId?: string;
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  createdAt?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize user from localStorage
    const savedUser = this.getSavedUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(savedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Get current user value
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if authenticated
  get isAuthenticated(): boolean {
    return !!this.currentUserValue && !!this.getToken();
  }

  // Alias for backward compatibility
  get isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  // Check if Spotify is connected
  get isSpotifyConnected(): boolean {
    return this.currentUserValue?.spotifyConnected || false;
  }

  // Get saved user from localStorage
  private getSavedUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.userKey);
      if (userJson) {
        return JSON.parse(userJson);
      }
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem(this.userKey);
    }
    return null;
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Save auth data
  private saveAuth(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  // Register - returns Observable<boolean>
  register(email: string, password: string, username?: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, {
      email,
      password,
      username: username || email.split('@')[0] // Use username or derive from email
    }).pipe(
      map(response => {
        console.log('Registration response:', response);
        this.saveAuth(response);
        return true; // Return true on success
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error; // Re-throw to be caught by component
      })
    );
  }

  // Login - returns Observable<boolean>
  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, {
      email,
      password
    }).pipe(
      map(response => {
        console.log('Login response:', response);
        this.saveAuth(response);
        return true; // Return true on success
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error; // Re-throw to be caught by component
      })
    );
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Connect Spotify
  connectSpotify(): void {
    // Save current URL for return after authorization
    const returnUrl = window.location.pathname;
    localStorage.setItem('spotify_return_url', returnUrl);

    // Redirect to backend Spotify auth endpoint
    const authUrl = `${API_URL}/auth/spotify`;
    window.location.href = authUrl;
  }

  // Handle Spotify callback
  handleSpotifyCallback(code: string): Observable<User> {
    return this.http.post<{ user: User }>(`${API_URL}/auth/spotify/callback`, {
      code
    }).pipe(
      map(response => {
        // Update user
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        return response.user;
      }),
      catchError(error => {
        console.error('Spotify callback error:', error);
        throw error;
      })
    );
  }

  // Disconnect Spotify
  disconnectSpotify(): Observable<User> {
    return this.http.post<{ user: User }>(`${API_URL}/auth/spotify/disconnect`, {})
      .pipe(
        map(response => {
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          return response.user;
        }),
        catchError(error => {
          console.error('Disconnect error:', error);
          throw error;
        })
      );
  }

  // Refresh user data
  refreshUser(): Observable<User> {
    return this.http.get<{ user: User }>(`${API_URL}/auth/me`)
      .pipe(
        map(response => {
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          return response.user;
        }),
        catchError(error => {
          console.error('Refresh user error:', error);
          throw error;
        })
      );
  }
}