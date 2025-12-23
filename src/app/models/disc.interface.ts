// models/disc.interface.ts
export interface Disc {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
  releaseDate: string;
  genre?: string;
  duration?: number;
  trackCount?: number;
  label?: string;
}

export interface SearchQuery {
  query: string;
  timestamp: Date;
}