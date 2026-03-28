<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            DaycareSeeder::class,
            SectionSeeder::class,
            AssessmentDomainSeeder::class,
            StudentSeeder::class,
            AssessmentSeeder::class,
        ]);
    }
}
