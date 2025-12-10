<?php

use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Member\TaskController as MemberTaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expense\RequestController;
use App\Http\Controllers\Expense\ApprovalController;
use App\Http\Controllers\Expense\PaymentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
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
        Route::put('/{id}', [UserController::class, 'update'])->name('.update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('.destroy');
    });

    // ========================================
    // EXPENSE MANAGEMENT ROUTES
    // ========================================
    Route::prefix('expenses')->name('expense.')->group(function () {

        // Dashboard
        Route::get('/dashboard', function () {
            return Inertia::render('expense/dashboard', [
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        })->name('expenseDashboard');

        // Request routes
        Route::get('/request', [RequestController::class, 'index'])->name('requestIndex');
        Route::get('/request/new', [RequestController::class, 'create'])->name('requestNew');
        Route::post('/request/new', [RequestController::class, 'store'])->name('requestStore');
        Route::get('/request/{id}', [RequestController::class, 'show'])->name('requestDetail');

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

        // Reports
        Route::get('/reports', function () {
            return Inertia::render('expense/reports/index', [
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        })->name('reports');
    });
});

require __DIR__ . '/settings.php';