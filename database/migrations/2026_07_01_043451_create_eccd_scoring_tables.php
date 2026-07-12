<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Table for Raw Score to Scaled Score conversion
        Schema::create('eccd_scale_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_id')->constrained('assessment_domains')->onDelete('cascade');
            $table->integer('min_months_age'); // e.g., 37
            $table->integer('max_months_age'); // e.g., 48
            $table->integer('scaled_score');   // e.g., 1 to 19
            $table->float('min_raw_score');
            $table->float('max_raw_score');
            $table->timestamps();
        });

        // Table for Sum of Scaled Scores to Standard Score conversion
        Schema::create('eccd_standard_rules', function (Blueprint $table) {
            $table->id();
            $table->integer('sum_scaled_score')->unique(); // e.g., 29
            $table->integer('standard_score');             // e.g., 37
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('eccd_standard_rules');
        Schema::dropIfExists('eccd_scale_rules');
    }
};
