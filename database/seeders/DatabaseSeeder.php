<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();



        $this->call(DivisionSeeder::class);

        $user = User::firstOrCreate(
            ['email' => 'admin.jkt@gmail.com'],
            [
                'name' => 'superadmin.jkt',
                'password' => Hash::make('password'),
                'location' => 'jkt',
                'email_verified_at' => now(),
                'role' => 'superadmin',
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'admin.jkt1@gmail.com'],
            [
                'name' => 'superadmin.jkt1',
                'password' => Hash::make('password'),
                'location' => 'jkt1',
                'email_verified_at' => now(),
                'role' => 'superadmin',
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'admin.sby@gmail.com'],
            [
                'name' => 'superadmin.sby',
                'password' => Hash::make('password'),
                'location' => 'sby',
                'email_verified_at' => now(),
                'role' => 'superadmin',
            ]
        );

        // Assign ke division (bisa banyak)
        $user->divisions()->attach(
            [1, 2] // Ganti dengan ID divisi yang sesuai
        );

    }
}
