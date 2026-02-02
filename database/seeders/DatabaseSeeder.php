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
            ['email' => 'superadmin@glori.com'],
            [
                'name' => 'superadmin.glori',
                'password' => Hash::make('password'),
                'location' => 'jkt',
                'email_verified_at' => now(),
                'role' => 'superadmin',
                'position' => 'head',
            ]
        );

        $user1 = User::firstOrCreate(
            ['email' => 'dirut@glori.com'],
            [
                'name' => 'Direktur GIB',
                'password' => Hash::make('password'),
                'location' => 'all',
                'email_verified_at' => now(),
                'role' => 'admin',
                'position' => 'direktur',
            ]
        );
        $user = User::firstOrCreate(
            ['email' => 'finance@glori.com'],
            [
                'name' => 'Finance Pusat',
                'password' => Hash::make('password'),
                'location' => 'all',
                'email_verified_at' => now(),
                'role' => 'admin',
                'position' => 'finance',
            ]
        );
        $user = User::firstOrCreate(
            ['email' => 'finjkt1@glori.com'],
            [
                'name' => 'Finance JKT1',
                'password' => Hash::make('password'),
                'location' => 'jkt1',
                'email_verified_at' => now(),
                'role' => 'admin',
                'position' => 'finance',
            ]
        );
        $user = User::firstOrCreate(
            ['email' => 'finsby@glori.com'],
            [
                'name' => 'Finance SBY',
                'password' => Hash::make('password'),
                'location' => 'sby',
                'email_verified_at' => now(),
                'role' => 'admin',
                'position' => 'finance',
            ]
        );
        $user2 = User::firstOrCreate(
            ['email' => 'hrdjkt@glori.com'],
            [
                'name' => 'HRD JKT',
                'password' => Hash::make('password'),
                'location' => 'jkt',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user2 = User::firstOrCreate(
            ['email' => 'hrdjkt1@glori.com'],
            [
                'name' => 'HRD JKT1',
                'password' => Hash::make('password'),
                'location' => 'jkt1',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user2 = User::firstOrCreate(
            ['email' => 'hrdsby@glori.com'],
            [
                'name' => 'HRD SBY',
                'password' => Hash::make('password'),
                'location' => 'sby',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user3 = User::firstOrCreate(
            ['email' => 'gajkt@glori.com'],
            [
                'name' => 'GA JKT',
                'password' => Hash::make('password'),
                'location' => 'jkt',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user3 = User::firstOrCreate(
            ['email' => 'gajkt1@glori.com'],
            [
                'name' => 'GA JKT1',
                'password' => Hash::make('password'),
                'location' => 'jkt1',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user3 = User::firstOrCreate(
            ['email' => 'gasby@glori.com'],
            [
                'name' => 'GA SBY',
                'password' => Hash::make('password'),
                'location' => 'sby',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user = User::firstOrCreate(
            ['email' => 'adminjkt@glori.com'],
            [
                'name' => 'Admin JKT',
                'password' => Hash::make('password'),
                'location' => 'jkt',
                'email_verified_at' => now(),
                'role' => 'admin',
                'position' => 'karyawan',
            ]
        );
        $user = User::firstOrCreate(
            ['email' => 'adminjkt1@glori.com'],
            [
                'name' => 'Admin JKT1',
                'password' => Hash::make('password'),
                'location' => 'jkt1',
                'email_verified_at' => now(),
                'role' => 'admin',
                'position' => 'karyawan',
            ]
        );
        $user = User::firstOrCreate(
            ['email' => 'adminsby@glori.com'],
            [
                'name' => 'Admin SBY',
                'password' => Hash::make('password'),
                'location' => 'sby',
                'email_verified_at' => now(),
                'role' => 'admin',
                'position' => 'karyawan',
            ]
        );
        $user4 = User::firstOrCreate(
            ['email' => 'wpjkt@glori.com'],
            [
                'name' => 'WP JKT',
                'password' => Hash::make('password'),
                'location' => 'jkt',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user4 = User::firstOrCreate(
            ['email' => 'wpjkt1@glori.com'],
            [
                'name' => 'WP JKT1',
                'password' => Hash::make('password'),
                'location' => 'jkt1',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user4 = User::firstOrCreate(
            ['email' => 'wpsby@glori.com'],
            [
                'name' => 'WP SBY',
                'password' => Hash::make('password'),
                'location' => 'sby',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user5 = User::firstOrCreate(
            ['email' => 'dealingkt@glori.com'],
            [
                'name' => 'Deal JKT',
                'password' => Hash::make('password'),
                'location' => 'jkt',
                'email_verified_at' => now(),
                'role' => 'user',
                'position' => 'karyawan',
            ]
        );
        $user6 = User::firstOrCreate(
            ['email' => 'itjkt@glori.com'],
            [
                'name' => 'IT JKT',
                'password' => Hash::make('password'),
                'location' => 'jkt',
                'email_verified_at' => now(),
                'role' => 'superadmin',
                'position' => 'direktur',
            ]
        );

        $users = User::whereIn('email', [
        'admin.jkt@glori.com',
        'admin.jkt1@glori.com',
        'admin.sby@glori.com',
        'finance@glori.com',
        'finjkt1@glori.com',
        'finsby@glori.com',
        'adminjkt@glori.com',
        'adminjkt1@glori.com',
        'adminsby@glori.com',
        ])->get();

        $users2 = User::whereIn('email', [
        'hrdjkt@glori.com',
        'hrdjkt1@glori.com',
        'hrdsby@glori.com',
        ])->get();

        $users3 = User::whereIn('email', [
        'gajkt@glori.com',
        'gajkt1@glori.com',
        'gasby@glori.com',
        ])->get();

        $users4 = User::whereIn('email', [
        'wpjkt@glori.com',
        'wpjkt1@glori.com',
        'wpsby@glori.com',
        ])->get();

        // Assign ke division (bisa banyak)
        foreach($users as $user) {
            $user->divisions()->syncWithoutDetaching(
                [6] // Ganti dengan ID divisi yang sesuai
            );
        }

        $user1->divisions()->syncWithoutDetaching(
            [11, 10, 9] // Ganti dengan ID divisi yang sesuai
        );

        foreach($users2 as $user2) {
            $user2->divisions()->syncWithoutDetaching(
                [1] // Ganti dengan ID divisi yang sesuai
            );
        }

        foreach($users3 as $user3) {
            $user3->divisions()->syncWithoutDetaching(
                [2] // Ganti dengan ID divisi yang sesuai
            );
        }
        
        foreach($users4 as $user4) {
            $user4->divisions()->syncWithoutDetaching(
                [7] // Ganti dengan ID divisi yang sesuai
            );
        }

        $user5->divisions()->syncWithoutDetaching(
            [4] // Ganti dengan ID divisi yang sesuai
        );

        $user6->divisions()->syncWithoutDetaching(
            [3] // Ganti dengan ID divisi yang sesuai
        );
    }
}
