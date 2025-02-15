export interface Income {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Business'
  | 'Rental'
  | 'Other';
