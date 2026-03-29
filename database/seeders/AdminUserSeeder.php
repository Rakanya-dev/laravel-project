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
            ['email' => 'admin@kidtrak.ph'],
            [
                'daycare_id' => null,
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'first_name' => 'Admin',
                'last_name' => 'User',
                // Updated to 8-digit format (standard in MM) or generic mobile
                'phone' => '09170000000',
                'status' => 'Active',
                'email_verified_at' => now(), // 👈 This instantly verifies the account
            ]
        );
    }
}
