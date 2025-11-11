<?php

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

    Route::get('tasks', function () {
        return Inertia::render('task/index');
    })->name('tasks');

    Route::get('tasks/create', function () {
        return Inertia::render('task/create');
    })->name('tasks.create');

    // My Tasks Routes
    Route::get('mytasks', function () {
        return Inertia::render('mytask/index');
    })->name('mytasks');

    Route::get('mytasks/create', function () {
        return Inertia::render('mytask/create');
    })->name('mytasks.create');
});

require __DIR__ . '/settings.php';