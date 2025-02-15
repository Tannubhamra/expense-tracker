import { Injectable, signal, computed } from '@angular/core';

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // Exchange rate relative to base currency (USD)
}

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
];

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private selectedCurrency = signal<Currency>(this.loadCurrency());
  currencies = CURRENCIES;

  currentSymbol = computed(() => this.selectedCurrency().symbol);
  currentRate = computed(() => this.selectedCurrency().rate);

  constructor() {}

  convert(amount: number): number {
    return amount * this.currentRate();
  }

  format(amount: number): string {
    return `${this.currentSymbol()}${this.convert(amount).toFixed(2)}`;
  }

  setCurrency(code: string) {
    const currency = CURRENCIES.find((c) => c.code === code);
    if (currency) {
      this.selectedCurrency.set(currency);
      localStorage.setItem('selected_currency', code);
    }
  }

  private loadCurrency(): Currency {
    const stored = localStorage.getItem('selected_currency');
    return CURRENCIES.find((c) => c.code === stored) || CURRENCIES[0];
  }
}
