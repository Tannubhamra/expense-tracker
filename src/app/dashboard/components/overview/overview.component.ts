import {
  Component,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsService } from '../../services/transactions.service';
import { Chart, registerables } from 'chart.js';
import { effect } from '@angular/core';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { FormsModule } from '@angular/forms';
import { CurrencyService } from '../../../core/services/currency.service';

Chart.register(...registerables);

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, FormsModule],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements AfterViewInit {
  @ViewChild('expensesChart') expensesChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;

  totalBalance = computed(() => this.transactionsService.balance());
  monthlyIncome = computed(
    () => this.transactionsService.getMonthlySummary().income
  );
  monthlyExpenses = computed(
    () => this.transactionsService.getMonthlySummary().expenses
  );
  monthlySavings = computed(
    () => this.monthlyIncome() - this.monthlyExpenses()
  );
  savingsRate = computed(() => {
    const income = this.monthlyIncome();
    return income ? (this.monthlySavings() / income) * 100 : 0;
  });

  expensesByCategory = computed(() => {
    const expenses = this.transactionsService.getExpenses()();
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  });

  monthlyTrends = computed(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      return d;
    }).reverse();

    return months.map((date) => {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      return {
        month: date.toLocaleString('default', { month: 'short' }),
        income: this.transactionsService.getIncomeForDateRange(start, end),
        expenses: this.transactionsService.getExpensesForDateRange(start, end),
      };
    });
  });

  monthlyBudget = computed(() => this.transactionsService.getMonthlyBudget()());
  budgetProgress = computed(() => {
    const expenses = this.monthlyExpenses();
    const budget = this.monthlyBudget();
    return Math.min((expenses / budget) * 100, 100);
  });

  budgetStatus = computed(() => {
    const remaining = this.monthlyBudget() - this.monthlyExpenses();
    return {
      amount: Math.abs(remaining),
      isOver: remaining < 0,
    };
  });

  remainingBudget = computed(() => this.transactionsService.remainingBudget());
  budgetPercentUsed = computed(() =>
    this.transactionsService.budgetPercentUsed()
  );

  savingsGoal = computed(() => this.transactionsService.getSavingsGoal()());
  savingsProgress = computed(() => this.transactionsService.savingsProgress());
  projectedDate = computed(() =>
    this.transactionsService.projectedSavingsDate()
  );

  isEditingBudget = signal(false);
  editBudgetValue = signal(0);

  isEditingSavings = signal(false);
  editSavingsValue = signal(0);

  private expensesChart?: Chart;
  private trendChart?: Chart;

  topExpenses = computed(() =>
    this.transactionsService.getTopExpenseCategories()
  );
  monthOverMonth = computed(() =>
    this.transactionsService.getMonthOverMonthChange()
  );
  averageDailyExpense = computed(() =>
    this.transactionsService.getAverageDailyExpense()
  );

  currencies = computed(() => this.currencyService.currencies);
  selectedCurrency = computed(() => this.currencyService.currentSymbol());
  formatCurrency = (amount: number) => this.currencyService.format(amount);

  constructor(
    private transactionsService: TransactionsService,
    public currencyService: CurrencyService
  ) {
    effect(() => {
      if (this.expensesChart) {
        const categories = this.expensesByCategory();
        this.expensesChart.data.labels = Object.keys(categories);
        this.expensesChart.data.datasets[0].data = Object.values(categories);
        this.expensesChart.update();
      }

      if (this.trendChart) {
        const trends = this.monthlyTrends();
        this.trendChart.data.labels = trends.map((t) => t.month);
        this.trendChart.data.datasets[0].data = trends.map((t) => t.income);
        this.trendChart.data.datasets[1].data = trends.map((t) => t.expenses);
        this.trendChart.update();
      }
    });
  }

  ngAfterViewInit() {
    this.createExpensesChart();
    this.createTrendChart();
  }

  trackByCode(index: number, currency: any) {
    return currency.code;
  }
  
  private createExpensesChart() {
    const categories = this.expensesByCategory();

    this.expensesChart = new Chart(this.expensesChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [
          {
            data: Object.values(categories),
            backgroundColor: [
              '#60A5FA',
              '#34D399',
              '#F87171',
              '#FBBF24',
              '#A78BFA',
              '#F472B6',
              '#6EE7B7',
              '#FCD34D',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
        },
      },
    });
  }

  private createTrendChart() {
    const trends = this.monthlyTrends();

    this.trendChart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: trends.map((t) => t.month),
        datasets: [
          {
            label: 'Income',
            data: trends.map((t) => t.income),
            borderColor: '#34D399',
            tension: 0.1,
          },
          {
            label: 'Expenses',
            data: trends.map((t) => t.expenses),
            borderColor: '#F87171',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  startEditBudget() {
    this.editBudgetValue.set(this.monthlyBudget());
    this.isEditingBudget.set(true);
  }

  saveBudget() {
    this.transactionsService.setMonthlyBudget(this.editBudgetValue());
    this.isEditingBudget.set(false);
  }

  cancelEditBudget() {
    this.isEditingBudget.set(false);
  }

  startEditSavings() {
    this.editSavingsValue.set(this.savingsGoal());
    this.isEditingSavings.set(true);
  }

  saveSavingsGoal() {
    this.transactionsService.setSavingsGoal(this.editSavingsValue());
    this.isEditingSavings.set(false);
  }

  cancelEditSavings() {
    this.isEditingSavings.set(false);
  }
}
