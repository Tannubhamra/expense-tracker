export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Housing'
  | 'Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Other';
