export interface TransactionFilter {
  search: string;
  category: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}
