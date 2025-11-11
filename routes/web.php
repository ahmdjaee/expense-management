<?php

use App\Http\Controllers\Admin\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('tasks' , [TaskController::class, 'index'])->name('tasks');
    Route::get('tasks/create', [TaskController::class, 'create'])->name('tasks.create');
    Route::post('tasks/store', [TaskController::class, 'store'])->name('task.store');
  
    Route::get('mytasks', function () {
        return Inertia::render('mytask/index');
    })->name('mytasks');
});

require __DIR__ . '/settings.php';
