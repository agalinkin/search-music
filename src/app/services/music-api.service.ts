// services/music-api.service.ts
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, catchError, switchMap,shareReplay } from 'rxjs/operators';
import { Disc } from '../models/disc.interface';


@Injectable({
  providedIn: 'root'
})
export class MusicApiService {
  private clientId = 'd36ee336e52242c6b4cefa667fd2bb55'; // Получите на https://developer.spotify.com
  private clientSecret = 'b471d641751b424baf89b4c99d54eea4';
  private tokenUrl = 'https://accounts.spotify.com/api/token';
  private apiUrl = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;

  constructor(@Inject(HttpClient) private http: HttpClient) {}

  // Получить токен доступа
  private getAccessToken(): Observable<string> {
    if (this.accessToken) {
      return of(this.accessToken);
    }

    const body = new HttpParams()
      .set('grant_type', 'client_credentials');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
    });

    return this.http.post<any>(this.tokenUrl, body.toString(), { headers }).pipe(
      map(response => {
        this.accessToken = response.access_token;
        return this.accessToken!;
      }),
      catchError(error => {
        console.error('Error getting access token:', error);
        return of('');
      })
    );
  }

  // Поиск альбомов
  searchDiscs(query: string): Observable<Disc[]> {
    if (!query.trim()) {
      return of([]);
    }

    return this.getAccessToken().pipe(
      switchMap(token => {
        if (!token) {
          return of([]);
        }

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        const params = new HttpParams()
          .set('q', query)
          .set('type', 'album')
          .set('limit', '20');

        return this.http.get<any>(`${this.apiUrl}/search`, { headers, params }).pipe(
          map(response => this.mapSpotifyAlbumsToDiscs(response.albums.items)),
          catchError(error => {
            console.error('Search error:', error);
            return of([]);
          })
        );
      })
    );
  }

  // Получить альбом по ID
  getDiscById(id: string): Observable<Disc | undefined> {
    console.log('Fetching album with ID:', id);
    
    return this.getAccessToken().pipe(
      switchMap(token => {
        if (!token) {
          console.error('No access token available');
          return of(undefined);
        }

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.get<any>(`${this.apiUrl}/albums/${id}`, { headers }).pipe(
          map(album => {
            console.log('Received album data:', album);
            return this.mapSpotifyAlbumToDisc(album);
          }),
          catchError(error => {
            console.error('Error fetching album:', error);
            return of(undefined);
          })
        );
      }),
      catchError(error => {
        console.error('Error in getDiscById:', error);
        return of(undefined);
      })
    );
  }

  // Преобразование данных Spotify в формат Disc
  private mapSpotifyAlbumsToDiscs(albums: any[]): Disc[] {
    return albums.map(album => this.mapSpotifyAlbumToDisc(album));
  }

  private mapSpotifyAlbumToDisc(album: any): Disc {
    console.log('Mapping album:', album);
    
    // Вычисляем общую продолжительность
    const duration = album.tracks?.items?.reduce((total: number, track: any) => {
      return total + (track.duration_ms || 0);
    }, 0) / 1000 || 0; // Конвертируем из миллисекунд в секунды

    const disc: Disc = {
      id: album.id || '',
      name: album.name || 'Unknown Album',
      artist: album.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      imageUrl: album.images?.[0]?.url || album.images?.[1]?.url || 'https://via.placeholder.com/300x300?text=No+Image',
      releaseDate: album.release_date || '',
      genre: album.genres?.[0] || 'Rock', // Spotify часто не возвращает жанры
      duration: Math.floor(duration),
      trackCount: album.total_tracks || album.tracks?.items?.length || 0,
      label: album.label || album.copyrights?.[0]?.text || 'Unknown Label'
    };

    console.log('Mapped disc:', disc);
    return disc;
  }
}