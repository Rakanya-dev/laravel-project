<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('daycare_domain', function (Blueprint $table) {
            $table->id();

            // Links to the Daycares table
            $table->foreignId('daycare_id')
                  ->constrained('daycares')
                  ->cascadeOnDelete();

            // Links to the Assessment Domains table
            $table->foreignId('domain_id')
                  ->constrained('assessment_domains')
                  ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('daycare_domain');
    }
};
