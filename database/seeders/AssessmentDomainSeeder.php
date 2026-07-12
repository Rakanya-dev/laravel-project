<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssessmentDomainSeeder extends Seeder
{
    public function run()
    {
        // Disable foreign key checks to allow truncate
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('assessment_domains')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $domains = [
            [
                'name' => 'Gross Motor',
                'description' => 'Large muscle movements and physical coordination.',
                'max_score' => 13, // Items 1-13
                'sort_order' => 0,
                'is_core' => true, // 🚀 ADDED THIS
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fine Motor',
                'description' => 'Precise hand and finger movements.',
                'max_score' => 11, // Items 1-11
                'sort_order' => 1,
                'is_core' => true, // 🚀 ADDED THIS
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Self-Help',
                'description' => 'Daily tasks like feeding, dressing, and hygiene.',
                'max_score' => 27, // Items 1-27
                'sort_order' => 2,
                'is_core' => true, // 🚀 ADDED THIS
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Receptive Language',
                'description' => 'Understanding spoken language and instructions.',
                'max_score' => 5, // Items 1-5
                'sort_order' => 3,
                'is_core' => true, // 🚀 ADDED THIS
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Expressive Language',
                'description' => 'Communicating thoughts using words and sentences.',
                'max_score' => 8, // Items 1-8
                'sort_order' => 4,
                'is_core' => true, // 🚀 ADDED THIS
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cognitive',
                'description' => 'Problem-solving, memory, and concept formation.',
                'max_score' => 21, // Items 1-21
                'sort_order' => 5,
                'is_core' => true, // 🚀 ADDED THIS
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Socio-Emotional',
                'description' => 'Emotional regulation and social interaction.',
                'max_score' => 24, // Items 1-24
                'sort_order' => 6,
                'is_core' => true, // 🚀 ADDED THIS
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('assessment_domains')->insert($domains);
    }
}
