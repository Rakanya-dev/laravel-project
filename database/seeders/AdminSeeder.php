<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            'name' => 'Admin',
            'email' => 'admin@daycare.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'daycare_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
