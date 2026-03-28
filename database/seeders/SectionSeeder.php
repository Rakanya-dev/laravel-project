<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Section;
use App\Models\Daycare;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch ALL daycares in the database
        $daycares = Daycare::all();

        if ($daycares->isEmpty()) {
            $this->command->warn('No daycares found. Skipping SectionSeeder.');
            return;
        }

        $this->command->info("Seeding 4 sessions (Max 80 capacity) for ALL {$daycares->count()} daycares...");

        // Loop through EVERY daycare and assign the 4 sessions
        foreach ($daycares as $daycare) {

            // 1. Session 1 (Morning Block)
            // Capacity: 25 | Total: 25/80
            Section::firstOrCreate([
                'daycare_id' => $daycare->id,
                'name' => 'Session 1 (4 years old)',
            ], [
                'form_type' => 'record_2',
                'start_time' => '08:00:00',
                'end_time' => '10:00:00',
                'capacity' => 25
            ]);

            // 2. Session 2 (Mid-Morning Block)
            // Capacity: 25 | Total: 50/80
            Section::firstOrCreate([
                'daycare_id' => $daycare->id,
                'name' => 'Session 2 (3 years old)',
            ], [
                'form_type' => 'record_2',
                'start_time' => '10:30:00',
                'end_time' => '12:30:00',
                'capacity' => 25
            ]);

            // 3. Session 3 (Afternoon Block)
            // Capacity: 25 | Total: 75/80
            Section::firstOrCreate([
                'daycare_id' => $daycare->id,
                'name' => 'Session 3 (4 years old)',
            ], [
                'form_type' => 'record_2',
                'start_time' => '13:30:00',
                'end_time' => '15:30:00',
                'capacity' => 25
            ]);

            // 4. ITED (Flexible Toddler Block)
            // Capacity: 5 | Total: 80/80 MAX
            Section::firstOrCreate([
                'daycare_id' => $daycare->id,
                'name' => 'ITED (1-2 years)',
            ], [
                'form_type' => 'record_1',
                'start_time' => '16:00:00',
                'end_time' => '17:00:00',
                'capacity' => 5
            ]);
        }

        $this->command->info('Successfully seeded 4 sessions for every daycare!');
    }
}
