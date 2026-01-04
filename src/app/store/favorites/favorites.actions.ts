// store/favorites/favorites.actions.ts
import { Disc } from '../../models/disc.interface';

export class LoadFavorites {
  static readonly type = '[Favorites] Load';
}

export class AddToFavorites {
  static readonly type = '[Favorites] Add';
  constructor(public disc: Disc) {}
}

export class RemoveFromFavorites {
  static readonly type = '[Favorites] Remove';
  constructor(public discId: string) {}
}

export class ClearFavorites {
  static readonly type = '[Favorites] Clear';
}