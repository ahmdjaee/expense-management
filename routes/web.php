<?php

use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CRM\DealController;
use App\Http\Controllers\CRM\LoginCodeController;
use App\Http\Controllers\Member\TaskController as MemberTaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expense\RequestController;
use App\Http\Controllers\Expense\ApprovalController;
use App\Http\Controllers\Expense\PaymentController;
use App\Http\Controllers\Expense\LPJController;
use App\Http\Controllers\Expense\DashboardController as ExpenseDashboardController;
use App\Http\Controllers\Expense\ReportsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    })->name('home');


    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ========================================
    // ADMIN TASK ROUTES
    // ========================================
    Route::prefix('tasks')->name('tasks')->group(function () {
        Route::get('/', [AdminTaskController::class, 'index']);

        Route::middleware(['role:admin,superadmin'])->group(function () {
            Route::get('/create', [AdminTaskController::class, 'create'])->name('.create');
            Route::post('/store', [AdminTaskController::class, 'store'])->name('.store');
            Route::get('/{id}/edit', [AdminTaskController::class, 'edit'])->name('.edit');
            Route::post('{id}/update', [AdminTaskController::class, 'update'])->name('.update');
            Route::delete('/{id}', [AdminTaskController::class, 'destroy'])->name('.destroy');
        });
    });

    // ========================================
    // MEMBER TASK ROUTES (My Tasks)
    // ========================================
    Route::prefix('mytasks')->name('mytasks')->group(function () {
        Route::get('/', [MemberTaskController::class, 'index']);
        Route::get('/create', [MemberTaskController::class, 'create'])->name('.create');
        Route::post('/store', [MemberTaskController::class, 'store'])->name('.store');
        Route::get('/{id}', [MemberTaskController::class, 'show'])->name('.show');
        Route::get('/{id}/edit', [MemberTaskController::class, 'edit'])->name('.edit');
        Route::put('/{id}', [MemberTaskController::class, 'update'])->name('.update');
        Route::patch('/{id}/status', [MemberTaskController::class, 'updateStatus'])->name('.updateStatus');
        Route::delete('/{id}', [MemberTaskController::class, 'destroy'])->name('.destroy');
    });

    // ========================================
    // USERS ROUTES
    // ========================================
    Route::prefix('users')->name('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/create', [UserController::class, 'create'])->name('.create');
        Route::post('/', [UserController::class, 'store'])->name('.store');
        Route::get('/{id}/edit', [UserController::class, 'edit'])->name('.edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('.update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('.destroy');
    });

    // ========================================
    // EXPENSE MANAGEMENT ROUTES
    // ========================================
    Route::prefix('expenses')->name('expense.')->group(function () {
        // Dashboard - Updated to use controller instead of closure
        Route::get('/dashboard', [ExpenseDashboardController::class, 'index'])->name('expenseDashboard');

        // Request routes
        Route::get('/request', [RequestController::class, 'index'])->name('requestIndex');
        Route::get('/request/new', [RequestController::class, 'create'])->name('requestNew');
        Route::post('/request/new', [RequestController::class, 'store'])->name('requestStore');
        Route::get('/request/{id}', [RequestController::class, 'show'])->name('requestDetail');
        Route::get('/request/{id}/edit', [RequestController::class, 'edit'])->name('requestEdit');
        Route::put('/request/{id}', [RequestController::class, 'update'])->name('requestUpdate');
        Route::delete('/request/{id}', [RequestController::class, 'destroy'])->name('requestDestroy');

        // Approval routes
        Route::get('/approvals', [ApprovalController::class, 'index'])->name('approvals');
        Route::get('/approvals/{id}', [ApprovalController::class, 'show'])->name('approvals.show');
        Route::post('/approvals/{id}/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
        Route::post('/approvals/{id}/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');

        // Payment routes
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments');
        Route::get('/payments/{id}', [PaymentController::class, 'show'])->name('payments.show');
        Route::post('/payments/{id}/process', [PaymentController::class, 'process'])->name('payments.process');
        Route::get('/payments-history', [PaymentController::class, 'history'])->name('payments.history');

        // LPJ routes
        Route::get('/lpj', [LPJController::class, 'index'])->name('lpj.index');
        Route::get('/lpj/{id}', [LPJController::class, 'show'])->name('lpj.show');
        Route::get('/lpj/{id}/create', [LPJController::class, 'create'])->name('lpj.create');
        Route::post('/lpj/{id}/submit', [LPJController::class, 'store'])->name('lpj.store');
        Route::post('/lpj/{id}/verify', [LPJController::class, 'verify'])->name('lpj.verify');

        // Reports - Updated to use controller instead of closure
        Route::get('/reports', [ReportsController::class, 'index'])->name('reports');
    });

    // ========================================
    // CRM ROUTES
    // ========================================
    Route::prefix('commissions')->group(function () {
        Route::get('/deals', [DealController::class, 'index'])->name('deals.index');
    });

    Route::prefix('commissions')->name('commissions.')->group(function () {
        Route::get('/deals', [DealController::class, 'index'])->name('deals.index');
        Route::post('/save-layers', [DealController::class, 'saveCommissionLayers'])->name('layers.save');
        Route::post('/calculate-commissions', [DealController::class, 'calculateAndSaveCommissions'])->name('calculate');
    });

    Route::prefix('crm')->group(function () {
        Route::get('/login-codes', [LoginCodeController::class, 'index'])->name('login-codes.index');
        Route::get('/login-codes/create', [LoginCodeController::class, 'create'])->name('login-codes.create');
        Route::post('/login-codes', [LoginCodeController::class, 'store'])->name('login-codes.store');
        Route::get('/login-codes/{id}/edit', [LoginCodeController::class, 'edit'])->name('login-codes.edit');
        Route::put('/login-codes/{id}', [LoginCodeController::class, 'update'])->name('login-codes.update');
        Route::delete('/login-codes/{id}', [LoginCodeController::class, 'destroy'])->name('login-codes.destroy');
        Route::post('/login-codes/bulk-delete', [LoginCodeController::class, 'bulkDestroy'])->name('login-codes.bulk-destroy');
    });
});

require __DIR__ . '/settings.php';