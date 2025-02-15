import { Injectable, signal } from '@angular/core';
import { computed } from '@angular/core';
import { Income } from '../interfaces/income.interface';
import { Expense } from '../interfaces/expense.interface';
import { NotificationService } from '../../core/services/notification.service';

const STORAGE_KEYS = {
  INCOMES: 'budget_tracker_incomes',
  EXPENSES: 'budget_tracker_expenses',
  MONTHLY_BUDGET: 'budget_tracker_monthly_budget',
  SAVINGS_GOAL: 'budget_tracker_savings_goal',
};

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  constructor(private notificationService: NotificationService) {
    this.incomes = signal<Income[]>(this.loadIncomes());
    this.expenses = signal<Expense[]>(this.loadExpenses());
    this.monthlyBudget = signal<number>(this.loadMonthlyBudget());
    this.savingsGoal = signal<number>(this.loadSavingsGoal());
  }

  private incomes = signal<Income[]>(this.loadIncomes());
  private expenses = signal<Expense[]>(this.loadExpenses());
  private monthlyBudget = signal<number>(this.loadMonthlyBudget());
  private savingsGoal = signal<number>(this.loadSavingsGoal());

  // Add milestone thresholds
  private readonly MILESTONES = [25, 50, 75, 100];
  private lastMilestone = signal<number>(0);

  // Computed values
  totalIncome = computed(() =>
    this.incomes().reduce((sum, income) => sum + income.amount, 0)
  );

  totalExpenses = computed(() =>
    this.expenses().reduce((sum, expense) => sum + expense.amount, 0)
  );

  balance = computed(() => this.totalIncome() - this.totalExpenses());

  // Add computed signals for budget tracking
  remainingBudget = computed(() => {
    const { expenses } = this.getMonthlySummary();
    return this.monthlyBudget() - expenses;
  });

  budgetPercentUsed = computed(() => {
    const { expenses } = this.getMonthlySummary();
    return (expenses / this.monthlyBudget()) * 100;
  });

  // Add computed for progress
  savingsProgress = computed(() => {
    const goal = this.savingsGoal();
    return goal ? (this.balance() / goal) * 100 : 0;
  });

  projectedSavingsDate = computed(() => {
    const goal = this.savingsGoal();
    const monthlySavings =
      this.getMonthlySummary().income - this.getMonthlySummary().expenses;

    if (monthlySavings <= 0) return null;

    const remaining = goal - this.balance();
    if (remaining <= 0) return null;

    const monthsToGoal = Math.ceil(remaining / monthlySavings);
    const date = new Date();
    date.setMonth(date.getMonth() + monthsToGoal);
    return date;
  });

  // Load data from localStorage
  private loadIncomes(): Income[] {
    const stored = localStorage.getItem(STORAGE_KEYS.INCOMES);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((income: any) => ({
        ...income,
        date: new Date(income.date),
      }));
    } catch {
      return [];
    }
  }

  private loadExpenses(): Expense[] {
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
      }));
    } catch {
      return [];
    }
  }

  // Save data to localStorage
  private saveIncomes(incomes: Income[]) {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }

  private saveExpenses(expenses: Expense[]) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  // Income methods
  getIncomes() {
    return this.incomes;
  }

  addIncome(income: Income) {
    this.incomes.update((incomes) => {
      const updated = [income, ...incomes];
      this.saveIncomes(updated);
      this.checkSavingsMilestones();
      return updated;
    });
  }

  deleteIncome(id: string) {
    this.incomes.update((incomes) => {
      const updated = incomes.filter((income) => income.id !== id);
      this.saveIncomes(updated);
      return updated;
    });
  }

  // Expense methods
  getExpenses() {
    return this.expenses;
  }

  // Add method to check if expense would exceed budget
  wouldExceedBudget(amount: number): boolean {
    const { expenses } = this.getMonthlySummary();
    return expenses + amount > this.monthlyBudget();
  }

  // Update addExpense to warn about budget
  addExpense(expense: Expense) {
    if (this.wouldExceedBudget(expense.amount)) {
      this.notificationService.warning(
        `This expense will exceed your monthly budget of $${this.monthlyBudget().toFixed(
          2
        )}`
      );
    }

    this.expenses.update((expenses) => {
      const updated = [expense, ...expenses];
      this.saveExpenses(updated);
      this.checkBudgetStatus();
      return updated;
    });
  }

  deleteExpense(id: string) {
    this.expenses.update((expenses) => {
      const updated = expenses.filter((expense) => expense.id !== id);
      this.saveExpenses(updated);
      return updated;
    });
  }

  // Summary methods
  getMonthlySummary(date: Date = new Date()) {
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthlyIncomes = this.incomes().filter((income) => {
      const incomeDate = new Date(income.date);
      return (
        incomeDate.getMonth() === month && incomeDate.getFullYear() === year
      );
    });

    const monthlyExpenses = this.expenses().filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === month && expenseDate.getFullYear() === year
      );
    });

    return {
      income: monthlyIncomes.reduce((sum, income) => sum + income.amount, 0),
      expenses: monthlyExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      ),
    };
  }

  getIncomeForDateRange(start: Date, end: Date): number {
    return this.getIncomes()().reduce((sum, income) => {
      if (income.date >= start && income.date <= end) {
        return sum + income.amount;
      }
      return sum;
    }, 0);
  }

  getExpensesForDateRange(start: Date, end: Date): number {
    return this.getExpenses()().reduce((sum, expense) => {
      if (expense.date >= start && expense.date <= end) {
        return sum + expense.amount;
      }
      return sum;
    }, 0);
  }

  // Monthly budget methods
  getMonthlyBudget() {
    return this.monthlyBudget;
  }

  setMonthlyBudget(amount: number) {
    const previousBudget = this.monthlyBudget();
    this.monthlyBudget.set(amount);
    localStorage.setItem(STORAGE_KEYS.MONTHLY_BUDGET, amount.toString());

    // Notify about budget changes
    if (previousBudget !== amount) {
      const difference = Math.abs(amount - previousBudget);
      if (amount > previousBudget) {
        this.notificationService.success(
          `Budget increased by $${difference.toFixed(2)}`
        );
      } else {
        this.notificationService.info(
          `Budget decreased by $${difference.toFixed(2)}`
        );
      }
    }
  }

  private loadMonthlyBudget(): number {
    const stored = localStorage.getItem(STORAGE_KEYS.MONTHLY_BUDGET);
    return stored ? Number(stored) : 2000; // Default budget
  }

  // Add new method to check budget status
  checkBudgetStatus() {
    const { expenses } = this.getMonthlySummary();
    const budget = this.monthlyBudget();
    const percentUsed = (expenses / budget) * 100;

    if (percentUsed >= 100) {
      this.notificationService.error(
        `Budget exceeded! You're ${(percentUsed - 100).toFixed(1)}% over budget`
      );
    } else if (percentUsed >= 90) {
      this.notificationService.warning(
        `Budget alert: You've used ${percentUsed.toFixed(
          1
        )}% of your monthly budget`
      );
    }
  }

  // Savings goal methods
  getSavingsGoal() {
    return this.savingsGoal;
  }

  setSavingsGoal(amount: number) {
    this.savingsGoal.set(amount);
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOAL, amount.toString());
    this.lastMilestone.set(0); // Reset milestone tracking
  }

  private loadSavingsGoal(): number {
    const stored = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOAL);
    return stored ? Number(stored) : 10000; // Default savings goal
  }

  // Add method to check savings milestones
  private checkSavingsMilestones() {
    const progress = this.savingsProgress();
    const lastMilestone = this.lastMilestone();

    for (const milestone of this.MILESTONES) {
      if (progress >= milestone && lastMilestone < milestone) {
        this.notificationService.success(
          `Congratulations! You've reached ${milestone}% of your savings goal!`
        );
        this.lastMilestone.set(milestone);
        break;
      }
    }
  }

  // Add analytics methods
  getTopExpenseCategories(limit: number = 5) {
    const expenses = this.expenses();
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  }

  getMonthOverMonthChange() {
    const currentMonth = this.getMonthlySummary();
    const lastMonth = this.getMonthlySummary(
      new Date(new Date().setMonth(new Date().getMonth() - 1))
    );

    return {
      income:
        lastMonth.income === 0
          ? currentMonth.income > 0
            ? 100
            : 0
          : ((currentMonth.income - lastMonth.income) / lastMonth.income) * 100,
      expenses:
        lastMonth.expenses === 0
          ? currentMonth.expenses > 0
            ? 100
            : 0
          : ((currentMonth.expenses - lastMonth.expenses) /
              lastMonth.expenses) *
            100,
    };
  }

  getAverageDailyExpense(days: number = 30) {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - days));
    const expenses = this.expenses().filter((e) => e.date >= start);
    return expenses.reduce((sum, e) => sum + e.amount, 0) / days;
  }
}
