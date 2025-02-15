import { Component, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Income, IncomeCategory } from '../../interfaces/income.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { TransactionsService } from '../../services/transactions.service';
import { Sort } from '../../interfaces/sort.interface';
import { SortHeaderComponent } from '../../../shared/components/sort-header/sort-header.component';
import { TransactionFilter } from '../../interfaces/filter.interface';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SortHeaderComponent,
  ],
  templateUrl: './income.component.html',
})
export class IncomeComponent {
  incomes: WritableSignal<Income[]>;
  showForm = signal(false);
  categories: IncomeCategory[] = [
    'Salary',
    'Freelance',
    'Investments',
    'Business',
    'Rental',
    'Other',
  ];

  incomeForm: FormGroup;

  sort = signal<Sort>({
    column: 'date',
    direction: 'desc',
  });

  filter = signal<TransactionFilter>({
    search: '',
    category: '',
    dateFrom: null,
    dateTo: null,
  });

  filterForm: FormGroup;

  // Add computed filtered and sorted incomes
  sortedIncomes = computed(() => {
    // First apply filters
    let result = this.incomes().filter((income) => {
      const filter = this.filter();
      if (filter.search) {
        const searchText = filter.search.toLowerCase();
        if (
          !income.description.toLowerCase().includes(searchText) &&
          !income.category.toLowerCase().includes(searchText)
        ) {
          return false;
        }
      }

      if (filter.category && income.category !== filter.category) {
        return false;
      }

      if (filter.dateFrom && income.date < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo) {
        const dateTo = new Date(filter.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        if (income.date > dateTo) {
          return false;
        }
      }

      return true;
    });

    // Then apply sorting
    const sortConfig = this.sort();
    return result.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.column) {
        case 'date':
          return (a.date.getTime() - b.date.getTime()) * direction;
        case 'amount':
          return (a.amount - b.amount) * direction;
        case 'category':
          return a.category.localeCompare(b.category) * direction;
        case 'description':
          return a.description.localeCompare(b.description) * direction;
        default:
          return 0;
      }
    });
  });

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private transactionsService: TransactionsService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      dateFrom: [''],
      dateTo: [''],
    });

    this.incomes = this.transactionsService.getIncomes();
    this.incomeForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
    });

    // Subscribe to filter form changes
    this.filterForm.valueChanges.subscribe((values) => {
      this.filter.update((current) => ({
        ...current,
        search: values.search || '',
        category: values.category || '',
        dateFrom: values.dateFrom ? new Date(values.dateFrom) : null,
        dateTo: values.dateTo ? new Date(values.dateTo) : null,
      }));
    });
  }

  addIncome() {
    if (this.incomeForm.valid) {
      const income: Income = {
        id: crypto.randomUUID(),
        ...this.incomeForm.value,
        amount: Number(this.incomeForm.value.amount),
        date: new Date(this.incomeForm.value.date!),
      };

      this.transactionsService.addIncome(income);
      this.notificationService.success('Income added successfully');
      this.incomeForm.reset({
        date: new Date().toISOString().split('T')[0],
      });
      this.showForm.set(false);
    }
  }

  deleteIncome(id: string) {
    this.transactionsService.deleteIncome(id);
    this.notificationService.info('Income deleted');
  }

  toggleForm() {
    this.showForm.update((show) => !show);
  }

  toggleSort(column: string) {
    this.sort.update((current) => {
      if (current.column === column) {
        return {
          column,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { column, direction: 'asc' };
    });
  }

  getSortIcon(column: string): 'asc' | 'desc' | 'none' {
    const current = this.sort();
    if (current.column !== column) return 'none';
    return current.direction;
  }

  clearFilters() {
    this.filterForm.reset();
  }
}
