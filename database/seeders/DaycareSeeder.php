<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Daycare;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class DaycareSeeder extends Seeder
{
    public function run(): void
    {
        $daycareDefinitions = [
            [
                'name' => 'Sto. Nino Child Development Center',
                'teacher_name' => 'Maria J. Torres',
                'teacher_email' => 'maria.torres@stnino.com',
                'established' => '2015',
                'address' => '123 Main Street, Phase 1',
                'city' => 'General Mariano Alvarez',
                'province' => 'Cavite',
                'postal_code' => '4117',
                'phone' => '09171234567',
                'email' => 'info@stnino-cdc.edu.ph',
                'capacity' => 80,
                'current_enrollment' => 75,
            ],
            [
                'name' => 'St. Bernadette Child Development Center',
                'teacher_name' => 'Marianne Santiago',
                'teacher_email' => 'marianne.santiago@stberna.com',
                'established' => '2012',
                'address' => '456 Oak Avenue, Phase 2',
                'city' => 'General Mariano Alvarez',
                'province' => 'Cavite',
                'postal_code' => '4117',
                'phone' => '09182345678',
                'email' => 'info@stbernadette-cdc.edu.ph',
                'capacity' => 80,
                'current_enrollment' => 68,
            ],
            [
                'name' => 'Holy Child Child Development Center',
                'teacher_name' => 'Leanna Ramos',
                'teacher_email' => 'leanna.ramos@holychild.com',
                'established' => '2018',
                'address' => '789 Pine Road, Barangay San Antonio',
                'city' => 'General Mariano Alvarez',
                'province' => 'Cavite',
                'postal_code' => '4117',
                'phone' => '09193456789',
                'email' => 'info@holychild-cdc.edu.ph',
                'capacity' => 80,
                'current_enrollment' => 72,
            ],
            [
                'name' => 'Saint Joseph Child Development Center',
                'teacher_name' => 'Kimberly Navarro',
                'teacher_email' => 'kimberly.navarro@stjoseph.com',
                'established' => '2010',
                'address' => '321 Elm Street, Barangay Del Pilar',
                'city' => 'General Mariano Alvarez',
                'province' => 'Cavite',
                'postal_code' => '4117',
                'phone' => '09204567890',
                'email' => 'info@stjoseph-cdc.edu.ph',
                'capacity' => 80,
                'current_enrollment' => 80, // Full capacity!
            ],
            [
                'name' => 'St. Anne Child Development Center',
                'teacher_name' => 'Maylene Cruz',
                'teacher_email' => 'maylene.cruz@stanne.com',
                'established' => '2016',
                'address' => '567 Maple Drive, Barangay San Miguel',
                'city' => 'General Mariano Alvarez',
                'province' => 'Cavite',
                'postal_code' => '4117',
                'phone' => '09215678901',
                'email' => 'info@stanne-cdc.edu.ph',
                'capacity' => 80,
                'current_enrollment' => 65,
            ],
        ];

        $licenseCounter = 1;

        foreach ($daycareDefinitions as $data) {
            // Create Daycare
            $daycare = Daycare::firstOrCreate(
                ['name' => $data['name']],
                [
                    'address' => $data['address'],
                    'city' => $data['city'],
                    'province' => $data['province'],
                    'postal_code' => $data['postal_code'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'principal_name' => $data['teacher_name'],
                    // 🚀 Region 4A (Cavite) DSWD License Format
                    'license_number' => 'DSWD-R4A-L-' . str_pad($licenseCounter++, 4, '0', STR_PAD_LEFT),
                    'capacity' => $data['capacity'],
                    'current_enrollment' => $data['current_enrollment'],
                    'status' => 'active',
                    'established_date' => Carbon::parse($data['established'] . '-01-01'),
                ]
            );

            // Create Teacher
            $nameParts = explode(' ', $data['teacher_name']);
            $firstName = $nameParts[0];
            $lastName = end($nameParts);

            User::firstOrCreate(
                ['email' => $data['teacher_email']],
                [
                    'daycare_id' => $daycare->id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone' => $data['phone'],
                    'password' => Hash::make('password123'),
                    'role' => 'teacher',
                    'status' => 'Active',
                ]
            );
        }
    }
}
