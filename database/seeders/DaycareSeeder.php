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
                'teacher_name' => 'Maria Torres',
                'teacher_email' => 'maria.torres@stnino.com',
                'established' => '2015',
                'address' => '123 Main Street, Phase 1',
                'city' => 'General Mariano Alvarez',
                'province' => 'Cavite',
                'postal_code' => '4117',
                // 🚀 Updated to match your phone.ts stripped backend format
                'phone' => '+639171234567',
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
                'phone' => '+639182345678',
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
                'phone' => '+639193456789',
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
                'phone' => '+639204567890',
                'email' => 'info@stjoseph-cdc.edu.ph',
                'capacity' => 80,
                'current_enrollment' => 80,
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
                'phone' => '+639215678901',
                'email' => 'info@stanne-cdc.edu.ph',
                'capacity' => 80,
                'current_enrollment' => 65,
            ],
        ];

        $licenseCounter = 1;

        foreach ($daycareDefinitions as $data) {

            // 🚀 SMARTER PARSING: Properly extract First, Middle, and Last names
            $nameParts = explode(' ', $data['teacher_name']);
            $firstName = array_shift($nameParts); // Takes the first word
            $lastName = array_pop($nameParts);    // Takes the last word
            $middleName = implode(' ', $nameParts); // Whatever is left becomes the middle name (e.g., "J.")

            // We reconstruct the exact string the User model will generate for "full_name"
            $generatedFullName = trim($firstName . ' ' . ($middleName ? $middleName . ' ' : '') . $lastName);

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
                    'principal_name' => $generatedFullName,
                    // 🚀 Save the EXACT matching name to the JSON array
                    'teachers' => [$generatedFullName],
                    'license_number' => 'DSWD-R4A-L-' . str_pad($licenseCounter++, 4, '0', STR_PAD_LEFT),
                    'capacity' => $data['capacity'],
                    'current_enrollment' => $data['current_enrollment'],
                    'status' => 'active',
                    'established_date' => Carbon::parse($data['established'] . '-01-01'),
                ]
            );

            // Create Teacher
            User::firstOrCreate(
                ['email' => $data['teacher_email']],
                [
                    'daycare_id' => $daycare->id,
                    'first_name' => $firstName,
                    'middle_name' => $middleName ?: null, // 🚀 Now saves "J." if it exists
                    'last_name' => $lastName,
                    'phone' => $data['phone'],
                    'password' => Hash::make('password123'),
                    'role' => 'teacher',
                    'status' => 'Active',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
