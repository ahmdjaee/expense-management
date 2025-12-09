<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'divisions' => ['required', 'array', 'min:1'],
            'divisions.*' => ['exists:divisions,id'],
        ])->validate();

        // Create user dengan position default 'karyawan'
        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'position' => 'karyawan', // Default position untuk user baru
        ]);

        // Assign ke division (bisa banyak)
        $user->divisions()->attach($input['divisions']);

        return $user;
    }
}