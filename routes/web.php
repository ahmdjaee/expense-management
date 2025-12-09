<?php

use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Member\TaskController as MemberTaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expense\RequestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    // Update route dashboard ke controller
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');


    // Hapus route yang duplikat ini karena sudah ada di dalam middleware auth

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
        Route::get('/request/detail', function () {
            return Inertia::render('expense/request/detail/index');
        })->name('requestDetail');

        Route::get('/request/new',[RequestController::class, 'create'])->name('requestNew');
        Route::post('/request/new',[RequestController::class, 'store'])->name('requestStore');

        Route::get('/request',[RequestController::class, 'index'])->name('requestIndex');


        Route::get('/dashboard', function () {
            return Inertia::render('expense/dashboard', [
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        })->name('expenseDashboard');

        Route::get('/approvals', function () {
            return Inertia::render('expense/approvals/index', [
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        })->name('approvals');

        Route::get('/payments', function () {
            return Inertia::render('expense/payments/index', [
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        })->name('payments');

        Route::get('/reports', function () {
            return Inertia::render('expense/reports/index', [
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        })->name('reports');

        // Detail request routes
        // Route::get('/requests/{id}', function ($id) {
        //     // In a real app, you would fetch the request from the database
        //     return Inertia::render('expense/requests/show', [
        //         'requestId' => $id,
        //         'auth' => [
        //             'user' => auth()->user(),
        //         ],
        //     ]);
        // })->name('requests.show');

        Route::get('/requests/{id}/pay', function ($id) {
            return Inertia::render('expense/requests/pay', [
                'requestId' => $id,
                'auth' => [
                    'user' => auth()->user(),
                ],
            ]);
        })->name('requests.pay');
    });
});

require __DIR__ . '/settings.php';