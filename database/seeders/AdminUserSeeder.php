<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Daycare;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        User::firstOrCreate(
            ['email' => 'admin@kidtrak.ph'],
            [
                'daycare_id' => null,
                'password' => Hash::make('password123'), // Default password
                'role' => 'admin',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '02-888-8888',
                'status' => 'active',
            ]
        );
    }
}
