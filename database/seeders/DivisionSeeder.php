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
                'name' => 'Human Resources',
                'description' => 'Handles recruitment, employee relations, and benefits management.',
            ],
            [
                'name' => 'Finance',
                'description' => 'Manages budgeting, accounting, and financial reporting.',
            ],
            [
                'name' => 'IT',
                'description' => 'Responsible for technology infrastructure, software development, and IT support.',
            ],
            [
                'name' => 'Marketing',
                'description' => 'Focuses on market research, advertising, and promotional activities.',
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
