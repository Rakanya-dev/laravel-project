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
        // 1. Create a "Head Office" Daycare first
        // We use firstOrCreate to avoid creating duplicates if you run the seeder again
        $headOffice = Daycare::firstOrCreate(
            ['name' => 'KIDTRAK Head Office'],
            [
                'address' => '123 Admin Plaza',
                'city' => 'Makati',
                'province' => 'Metro Manila',
                'postal_code' => '1200',
                'phone' => '02-888-8888',
                'email' => 'admin@kidtrak.ph',
                'principal_name' => 'System Administrator',
                'status' => 'active',
            ]
        );

        // 2. Create the Admin User
        // We use firstOrCreate to avoid duplicates here too
        User::firstOrCreate(
            ['email' => 'admin@kidtrak.ph'],
            [
                'daycare_id' => $headOffice->id,
                'password' => Hash::make('password123'), // Default password
                'role' => 'admin',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '02-888-8888',
                'status' => 'active', // 'pending' by default, so we set to 'active'
            ]
        );
    }
}
