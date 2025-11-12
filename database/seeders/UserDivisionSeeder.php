<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserDivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada divisions dulu
        $divisions = Division::all();

        if ($divisions->isEmpty()) {
            $this->command->info('No divisions found. Creating default divisions...');

            $divisionData = [
                ['name' => 'Engineering', 'description' => 'Engineering Department'],
                ['name' => 'Design', 'description' => 'Design Department'],
                ['name' => 'Marketing', 'description' => 'Marketing Department'],
                ['name' => 'Product', 'description' => 'Product Department'],
                ['name' => 'HR', 'description' => 'Human Resources Department'],
            ];

            foreach ($divisionData as $div) {
                Division::create($div);
            }

            $divisions = Division::all();
        }

        // Assign random division ke semua users yang belum punya division
        $users = User::whereNull('division_id')->get();

        foreach ($users as $user) {
            $user->update([
                'division_id' => $divisions->random()->id
            ]);

            $this->command->info("Assigned {$user->name} to division");
        }

        $this->command->info('User divisions seeded successfully!');
    }
}