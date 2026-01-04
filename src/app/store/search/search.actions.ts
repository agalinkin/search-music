// store/search/search.actions.ts
import { Disc } from '../../models/disc.interface';

export class PerformSearch {
  static readonly type = '[Search] Perform Search';
  constructor(public query: string) {}
}

export class ClearSearch {
  static readonly type = '[Search] Clear';
}


