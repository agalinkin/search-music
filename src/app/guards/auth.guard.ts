// guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn) {
      return true;
    }

    // Не залогинен - редирект на логин
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}

// guards/spotify-guard.ts
@Injectable({
  providedIn: 'root'
})
export class SpotifyGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isSpotifyConnected) {
      return true;
    }

    // Spotify не подключен
    alert('Please connect your Spotify account first');
    this.router.navigate(['/profile']);
    return false;
  }
}