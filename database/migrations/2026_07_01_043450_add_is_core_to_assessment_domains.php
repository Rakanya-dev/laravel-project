<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('assessment_domains', function (Blueprint $table) {
            // New custom domains default to false (Supplemental)
            // We will manually set the original 7 to true in the next step
            $table->boolean('is_core')->default(false)->after('max_score');
        });
    }

    public function down()
    {
        Schema::table('assessment_domains', function (Blueprint $table) {
            $table->dropColumn('is_core');
        });
    }
};
