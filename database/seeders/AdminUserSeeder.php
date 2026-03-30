<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'laravelkidtrak@gmail.com'],
            [
                'daycare_id' => null,
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'first_name' => 'Juan',
                'middle_name' => 'Dela', // 👈 Can be a string or simply null
                'last_name' => 'Cruz',
                'phone' => '+639170000000',
                'status' => 'Active',
                'email_verified_at' => now(),
            ]
        );
    }
}
