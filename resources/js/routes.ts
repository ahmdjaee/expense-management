// resources/js/routes.ts
// Helper functions untuk route URLs

export const dashboard = () => '/dashboard';

// Task Management Routes
export const tasks = () => '/tasks';
export const tasksCreate = () => '/tasks/create';
export const tasksEdit = (id: string) => `/tasks/${id}/edit`;

export const mytasks = () => '/mytasks';
export const mytasksCreate = () => '/mytasks/create';
export const mytasksShow = (id: string) => `/mytasks/${id}`;
export const mytasksEdit = (id: string) => `/mytasks/${id}/edit`;

// User Management Routes
export const users = () => '/users';
export const usersCreate = () => '/users/create';
export const usersEdit = (id: string) => `/users/${id}/edit`;

// Expense Management Routes
export const expenseDashboard = () => '/expense/dashboard';
export const expense = () => '/expense/request';
export const expenseNew = () => '/expense/request/new';
export const expenseDetail = (id: string) => `/expense/request/detail/${id}`;

// Expense Approvals
export const expenseApprovals = () => '/expense/approvals';

// Expense Payments
export const expensePayments = () => '/expense/payments';
export const expensePaymentProcess = (id: string) => `/expense/requests/${id}/pay`;

// Expense Reports
export const expenseReports = () => '/expense/reports';

// Expense Requests
export const expenseRequestShow = (id: string) => `/expense/requests/${id}`;
export const expenseRequestPay = (id: string) => `/expense/requests/${id}/pay`;
