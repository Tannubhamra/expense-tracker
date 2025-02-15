export type SortDirection = 'asc' | 'desc';

export interface Sort {
  column: string;
  direction: SortDirection;
}
