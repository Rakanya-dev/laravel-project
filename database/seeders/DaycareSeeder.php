<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Daycare;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class DaycareSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
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
                'phone' => '09171234567', // 👈 UPDATED
                'email' => 'info@stnino-cdc.edu.ph',
                'capacity' => 50,
                'current_enrollment' => 45,
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
                'phone' => '09182345678', // 👈 UPDATED
                'email' => 'info@stbernadette-cdc.edu.ph',
                'capacity' => 50,
                'current_enrollment' => 39,
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
                'phone' => '09193456789', // 👈 UPDATED
                'email' => 'info@holychild-cdc.edu.ph',
                'capacity' => 40,
                'current_enrollment' => 35,
            ],
            [
                'name' => 'Saint. Joseph Child Development Center',
                'teacher_name' => 'Kimberly Navarro',
                'teacher_email' => 'kimberly.navarro@stjoseph.com',
                'established' => '2010',
                'address' => '321 Elm Street, Barangay Del Pilar',
                'city' => 'General Mariano Alvarez',
                'province' => 'Cavite',
                'postal_code' => '4117',
                'phone' => '09204567890', // 👈 UPDATED
                'email' => 'info@stjoseph-cdc.edu.ph',
                'capacity' => 50,
                'current_enrollment' => 50,
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
                'phone' => '09215678901', // 👈 UPDATED
                'email' => 'info@stanne-cdc.edu.ph',
                'capacity' => 50,
                'current_enrollment' => 46,
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
                    'license_number' => 'DC-' . $licenseCounter++ . '2025',
                    'capacity' => $data['capacity'],
                    'current_enrollment' => $data['current_enrollment'],
                    'status' => 'active',
                    'established_date' => Carbon::parse($data['established'] . '-01-01'),
                ]
            );

            // Create Teacher User linked to Daycare
            $nameParts = explode(' ', $data['teacher_name']);
            $firstName = $nameParts[0];
            $lastName = end($nameParts);
            $middleName = count($nameParts) > 2 ? $nameParts[1] : null;

            User::firstOrCreate(
                ['email' => $data['teacher_email']],
                [
                    'daycare_id' => $daycare->id,
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'last_name' => $lastName,
                    'phone' => $data['phone'],
                    'password' => Hash::make('password123'),
                    'role' => 'teacher',
                    'status' => 'active',
                ]
            );
        }
    }
}
