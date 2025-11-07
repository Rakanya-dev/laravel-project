<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DaycareSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {

        DB::table('daycares')->insert([
            [
                'daycare_name' => 'GMA Child Development Center',
                'address' => 'Brgy. San Gabriel, GMA, Cavite',
                'contact_person' => 'Teacher Joy',
                'contact_number' => '09171234567',
            ],
            [
                'daycare_name' => 'San Isidro Daycare',
                'address' => 'Brgy. San Isidro, GMA, Cavite',
                'contact_person' => 'Teacher Maan',
                'contact_number' => '09181234567',
            ],
            [
                'daycare_name' => 'Sta. Cruz Learning Hub',
                'address' => 'Brgy. Sta. Cruz, GMA, Cavite',
                'contact_person' => 'Teacher Lea',
                'contact_number' => '09192223333',
            ],
            [
                'daycare_name' => 'Little Explorers Academy',
                'address' => 'Poblacion, GMA, Cavite',
                'contact_person' => 'Teacher Kim',
                'contact_number' => '09193456789',
            ],
            [
                'daycare_name' => 'Bright Minds Daycare',
                'address' => 'Brgy. F. Reyes, GMA, Cavite',
                'contact_person' => 'Teacher May',
                'contact_number' => '09201112222',
            ],

        ]);

    }
}
