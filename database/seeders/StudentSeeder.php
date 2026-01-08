<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Daycare;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_PH');

        // 1. Define specific "VIP" students
        $vipStudentsData = [
            'Sto. Nino Child Development Center' => [
                [
                    'child' => ['first_name' => 'Ezmielle Zicus', 'last_name' => 'Gammad', 'middle_name' => 'Reyes', 'dob' => '2021-10-15', 'gender' => 'Female', 'nickname' => 'Ezmi'],
                    'parent' => ['first_name' => 'Maria', 'last_name' => 'Gammad', 'email' => 'maria.gammad@gmail.com', 'phone' => '09171234567', 'relation' => 'Mother']
                ],
                [
                    'child' => ['first_name' => 'Elijah', 'last_name' => 'Cruz', 'middle_name' => 'Ramos', 'dob' => '2020-05-20', 'gender' => 'Male', 'nickname' => 'Eli'],
                    'parent' => ['first_name' => 'Juan', 'last_name' => 'Cruz', 'email' => 'juan.cruz@gmail.com', 'phone' => '09182223333', 'relation' => 'Father']
                ],
            ],
        ];

        // 2. Get all daycares
        $daycares = Daycare::all();

        foreach ($daycares as $daycare) {
            $this->command->info("Seeding {$daycare->name}...");

            // --- Step A: Add VIP Students ---
            if (isset($vipStudentsData[$daycare->name])) {
                foreach ($vipStudentsData[$daycare->name] as $data) {
                    $this->createStudentWithParent($daycare, $data['child'], $data['parent']);
                }
            }

            // --- Step B: Fill capacity with Random Space ---
            $currentCount = Student::where('daycare_id', $daycare->id)->count();
            $capacity = $daycare->capacity ?? 50;

            //  NEW: Leave 1-10 spots open randomly
            $emptySlotsToLeave = rand(1, 10);
            $targetEnrollment = max(0, $capacity - $emptySlotsToLeave);

            $slotsToFill = max(0, $targetEnrollment - $currentCount);

            if ($slotsToFill > 0) {
                $this->command->info("  - Generating {$slotsToFill} random students (Leaving {$emptySlotsToLeave} empty slots).");

                for ($i = 0; $i < $slotsToFill; $i++) {
                    $gender = $faker->randomElement(['Male', 'Female']);
                    $firstName = $gender == 'Male' ? $faker->firstNameMale : $faker->firstNameFemale;
                    $lastName = $faker->lastName;

                    $childData = [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'middle_name' => $faker->lastName,
                        'dob' => $faker->dateTimeBetween('-5 years', '-3 years')->format('Y-m-d'),
                        'gender' => $gender,
                        'nickname' => substr($firstName, 0, 4),
                    ];

                    $parentData = null;
                    if (rand(1, 100) <= 80) {
                        $parentData = [
                            'first_name' => $gender == 'Male' ? $faker->firstNameFemale : $faker->firstNameMale,
                            'last_name' => $lastName,
                            'email' => $faker->unique()->safeEmail,
                            'phone' => '09' . $faker->numerify('#########'),
                            'relation' => 'Guardian'
                        ];
                    }

                    $this->createStudentWithParent($daycare, $childData, $parentData);
                }
            }

            // Update enrollment count
            $daycare->update(['current_enrollment' => Student::where('daycare_id', $daycare->id)->count()]);
        }
    }

    private function createStudentWithParent($daycare, $childData, $parentData)
    {
        $student = Student::firstOrCreate(
            [
                'first_name' => $childData['first_name'],
                'last_name' => $childData['last_name'],
                'daycare_id' => $daycare->id,
            ],
            [
                'middle_name' => $childData['middle_name'],
                'date_of_birth' => $childData['dob'],
                'gender' => $childData['gender'],
                'status' => 'Active',
                'nickname' => $childData['nickname'],
                'access_code' => strtoupper(substr($childData['first_name'], 0, 1) . substr($childData['last_name'], 0, 1)) . '-' . rand(1000, 9999),
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
                    'status' => 'active',
                    'phone' => $parentData['phone'],
                    'daycare_id' => $daycare->id,
                ]
            );

            if (!$student->parents()->where('parent_id', $parent->id)->exists()) {
                $student->parents()->attach($parent->id, [
                    'relationship' => $parentData['relation'],
                    'is_primary' => true,
                    'status' => 'Active'
                ]);
            }
        }
    }
}
