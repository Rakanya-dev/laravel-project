<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'first_name' => 'Admin',
            'middle_name' => '',
            'last_name' => 'User',
            'email' => 'admin@daycare.com',
            'contact_number' => '09123456789',
            'password' => Hash::make('admin123'), // Use env var for production
            'account_type' => 'admin',
            'daycare_id' => null, // Admin might assign this later
            'email_verified_at' => now(),
            'remember_token' => null,
        ]);
    }
}
