<?php

namespace Database\Seeders;

use App\Models\Divisi;
use App\Models\Division;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            [
                'name' => 'HRD',
                'description' => 'Handles recruitment, employee relations, and benefits management.',
            ],
            [
                'name' => 'GA',
                'description' => 'Handles general administrative tasks, facility management, and office support.',
            ],
            [
                'name' => 'IT',
                'description' => 'Manages technology infrastructure, software development, and IT support.',
            ],
            [
                'name' => 'DEALING',
                'description' => 'Responsible for technology infrastructure, software development, and IT support.',
            ],
            [
                'name' => 'ACCOUNTING',
                'description' => 'Focuses on market research, advertising, and promotional activities.',
            ],
            [
                'name' => 'FINANCE',
                'description' => 'Manages budgeting, accounting, and financial reporting.',
            ],
            [
                'name' => 'WAKIL PIALANG',
                'description' => 'Focuses on market research, advertising, and promotional activities.',
            ],
            [
                'name' => 'MARKETING',
                'description' => 'Focuses on market research, advertising, and promotional activities.',
            ],
            [
                'name' => 'COMPLIANCE DIRECTOR',
                'description' => 'Ensures that the company adheres to legal standards and internal policies.',
            ],
            [
                'name' => 'OPERATIONAL DIRECTOR',
                'description' => 'Oversees daily operations and ensures efficient business processes.',
            ],
            [
                'name' => 'DIRECTOR',
                'description' => 'Provides strategic direction and leadership for the company.',
            ],
        ];

        foreach ($divisions as $division) {
            Division::firstOrCreate(
                ['name' => $division['name']],
                ['description' => $division['description']]
            );
        }
    }
}
