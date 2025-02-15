import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { OverviewComponent } from './components/overview/overview.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        component: OverviewComponent,
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./components/expenses/expenses.component').then(
            (m) => m.ExpensesComponent
          ),
      },
      {
        path: 'income',
        loadComponent: () =>
          import('./components/income/income.component').then(
            (m) => m.IncomeComponent
          ),
      },
    ],
  },
];
