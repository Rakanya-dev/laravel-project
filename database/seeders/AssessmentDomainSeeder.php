<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AssessmentDomain;

class AssessmentDomainSeeder extends Seeder
{
    public function run(): void
    {
        $domains = [
            ['name' => 'Gross Motor', 'sort_order' => 1],
            ['name' => 'Fine Motor', 'sort_order' => 2],
            ['name' => 'Self-Help', 'sort_order' => 3],
            ['name' => 'Receptive Language', 'sort_order' => 4],
            ['name' => 'Expressive Language', 'sort_order' => 5],
            ['name' => 'Cognitive', 'sort_order' => 6],
            ['name' => 'Social-Emotional', 'sort_order' => 7],
        ];

        foreach ($domains as $domain) {
            AssessmentDomain::firstOrCreate(
                ['name' => $domain['name']],
                $domain
            );
        }
    }
}
