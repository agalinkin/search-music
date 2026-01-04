// store/history/history.actions.ts

export class LoadSearchHistory {
  static readonly type = '[History] Load';
}

export class AddSearchHistory {
  static readonly type = '[History] Add';
  constructor(public query: string, public resultsCount: number) {}
}

export class RemoveSearchHistory {
  static readonly type = '[History] Remove';
  constructor(public query: string) {}
}

export class ClearSearchHistory {
  static readonly type = '[History] Clear';
}

