import { Component, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Expense, ExpenseCategory } from '../../interfaces/expense.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionFilter } from '../../interfaces/filter.interface';
import { Sort } from '../../interfaces/sort.interface';
import { SortHeaderComponent } from '../../../shared/components/sort-header/sort-header.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SortHeaderComponent,
  ],
  templateUrl: './expenses.component.html',
})
export class ExpensesComponent {
  expenses: WritableSignal<Expense[]>;
  showForm = signal(false);
  categories: ExpenseCategory[] = [
    'Food',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Other',
  ];

  filter = signal<TransactionFilter>({
    search: '',
    category: '',
    dateFrom: null,
    dateTo: null,
  });

  sort = signal<Sort>({
    column: 'date',
    direction: 'desc',
  });

  filteredExpenses = computed(() => {
    let result = this.expenses().filter((expense) => {
      const filter = this.filter();
      if (filter.search) {
        const searchText = filter.search.toLowerCase();
        if (
          !expense.description.toLowerCase().includes(searchText) &&
          !expense.category.toLowerCase().includes(searchText)
        ) {
          return false;
        }
      }

      if (filter.category && expense.category !== filter.category) {
        return false;
      }

      if (filter.dateFrom && expense.date < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo) {
        const dateTo = new Date(filter.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        if (expense.date > dateTo) {
          return false;
        }
      }

      return true;
    });

    // Apply sorting
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

  filterForm: FormGroup;

  expenseForm: FormGroup;

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

    this.expenses = this.transactionsService.getExpenses();
    this.expenseForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
    });

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

  addExpense() {
    if (this.expenseForm.valid) {
      const expense: Expense = {
        id: crypto.randomUUID(),
        ...this.expenseForm.value,
        amount: Number(this.expenseForm.value.amount),
        date: new Date(this.expenseForm.value.date!),
      };

      this.transactionsService.addExpense(expense);
      this.notificationService.success('Expense added successfully');
      this.expenseForm.reset({
        date: new Date().toISOString().split('T')[0],
      });
      this.showForm.set(false);
    }
  }

  deleteExpense(id: string) {
    this.transactionsService.deleteExpense(id);
    this.notificationService.info('Expense deleted');
  }

  toggleForm() {
    this.showForm.update((show) => !show);
  }

  clearFilters() {
    this.filterForm.reset();
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
}
