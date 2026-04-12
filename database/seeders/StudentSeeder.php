<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Daycare;
use App\Models\Student;
use App\Models\User;
use App\Models\Section;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use Carbon\Carbon;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('en_PH');

        // 1. VIP Students (Specific real cases)
        $vipStudentsData = [
            'Sto. Nino Child Development Center' => [
                [
                    'child' => ['first_name' => 'Ezmielle Zicus', 'last_name' => 'Gammad', 'middle_name' => 'Reyes', 'dob' => '2021-10-15', 'gender' => 'Female', 'nickname' => 'Ezmi'],
                    'parent' => ['first_name' => 'Maria', 'last_name' => 'Gammad', 'email' => 'maria.gammad@gmail.com', 'phone' => '+63 917 123 4567', 'relation' => 'Mother']
                ],
                [
                    'child' => ['first_name' => 'Elijah', 'last_name' => 'Cruz', 'middle_name' => 'Ramos', 'dob' => '2020-05-20', 'gender' => 'Male', 'nickname' => 'Eli'],
                    'parent' => ['first_name' => 'Juan', 'last_name' => 'Cruz', 'email' => 'juan.cruz@gmail.com', 'phone' => '+63 918 222 3333', 'relation' => 'Father']
                ],
            ],
        ];

        $daycares = Daycare::with('sections')->get();
        $studentCounter = 1;

        foreach ($daycares as $daycare) {
            $this->command->info("Seeding {$daycare->name}...");
            $sections = $daycare->sections;

            // Step A: Add VIP Students
            if (isset($vipStudentsData[$daycare->name])) {
                foreach ($vipStudentsData[$daycare->name] as $data) {
                    // VIPs figure out their own section based on age
                    $this->createStudentWithParent($daycare, $data['child'], $data['parent'], $sections, null, $studentCounter++);
                }
            }

            // Step B: Fill each section to its specific capacity with the EXACT right age group
            foreach ($sections as $section) {
                // Determine the age range needed for this specific section
                if (str_contains($section->name, 'ITED')) {
                    $minAge = 1; $maxAge = 2;
                } elseif (str_contains($section->name, '3 years')) {
                    $minAge = 3; $maxAge = 3;
                } else {
                    $minAge = 4; $maxAge = 5; // Sessions 1 & 3
                }

                $currentCount = Student::where('section_id', $section->id)->count();
                // Fill up to capacity, minus a random 0-2 so classes look realistically "almost full"
                $targetEnrollment = max(0, $section->capacity - rand(0, 2));
                $slotsToFill = max(0, $targetEnrollment - $currentCount);

                for ($i = 0; $i < $slotsToFill; $i++) {
                    $gender = $faker->randomElement(['Male', 'Female']);
                    $firstName = $gender == 'Male' ? $faker->firstNameMale : $faker->firstNameFemale;
                    $lastName = $faker->lastName;

                    // 🚀 Generate a birthdate strictly within the required age bracket for this section
                    $randomDob = $faker->dateTimeBetween("-{$maxAge} years -11 months", "-{$minAge} years")->format('Y-m-d');

                    $childData = [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'middle_name' => $faker->lastName,
                        'dob' => $randomDob,
                        'gender' => $gender,
                        'nickname' => substr($firstName, 0, 4),
                    ];

                    $parentData = null;
                    if (rand(1, 100) <= 90) { // 90% chance to have a parent account
                        $isMother = $faker->boolean(70);
                        $parentData = [
                            'first_name' => $isMother ? $faker->firstNameFemale : $faker->firstNameMale,
                            'last_name' => $lastName,
                            'email' => $faker->unique()->safeEmail,
                            // 🚀 Updated Faker logic for PH Mobile format
                            'phone' => $faker->numerify('+63 9## ### ####'),
                            'relation' => $isMother ? 'Mother' : 'Father'
                        ];
                    }

                    // Pass the exact section ID so we bypass guessing
                    $this->createStudentWithParent($daycare, $childData, $parentData, $sections, $section->id, $studentCounter++);
                }
            }

            $daycare->update(['current_enrollment' => Student::where('daycare_id', $daycare->id)->count()]);
        }
    }

    private function createStudentWithParent($daycare, $childData, $parentData, $sections, $forcedSectionId, $counter)
    {
        $dob = Carbon::parse($childData['dob']);
        $ageYears = $dob->age;
        $sectionId = $forcedSectionId;

        // 🚀 SMART SECTION FALLBACK (Used primarily for the VIP students)
        if (!$sectionId && $sections && $sections->count() > 0) {
            if ($ageYears < 3) {
                $validSection = $sections->firstWhere('name', 'ITED (1-2 years)');
            } elseif ($ageYears == 3) {
                $validSection = $sections->firstWhere('name', 'Session 2 (3 years old)');
            } else {
                // Find Session 1 or 3 for the 4-year-olds
                $validSections = $sections->filter(function ($sec) {
                    return str_contains($sec->name, '4 years');
                });
                $validSection = $validSections->isNotEmpty() ? $validSections->random() : null;
            }

            if ($validSection) {
                $sectionId = $validSection->id;
            }
        }

        $student = Student::firstOrCreate(
            [
                'first_name' => $childData['first_name'],
                'last_name' => $childData['last_name'],
                'daycare_id' => $daycare->id,
            ],
            [
                'section_id' => $sectionId,
                'student_id' => date('Y') . '-' . str_pad($counter, 4, '0', STR_PAD_LEFT),
                'middle_name' => $childData['middle_name'],
                'date_of_birth' => $childData['dob'],
                'gender' => $childData['gender'],
                'age_years' => $ageYears,
                'age_months' => $dob->diffInMonths(now()) % 12,
                'status' => 'Active',
                'nickname' => $childData['nickname'],
                'access_code' => strtoupper(substr($childData['first_name'], 0, 1) . substr($childData['last_name'], 0, 1)) . '-' . rand(1000, 9999),
                'enrollment_date' => now()->format('Y-m-d'),
            ]
        );

        if ($parentData) {
            $parent = User::firstOrCreate(
                ['email' => $parentData['email']],
                [
                    'first_name' => $parentData['first_name'],
                    'last_name' => $parentData['last_name'],
                    'password' => Hash::make('password123'),
                    'role' => 'parent',
                    'status' => 'Active',
                    'phone' => $parentData['phone'],
                    'email_verified_at' => now(), // 👈 This instantly verifies the account
                ]
            );

            if (!$student->parents()->where('parent_id', $parent->id)->exists()) {
                $student->parents()->attach($parent->id, [
                    'relationship' => $parentData['relation'],
                    'is_primary' => true,
                    'status' => 'Pending' // Or 'Approved' if you want them to log in immediately
                ]);
            }
        }
    }
}
