<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('daycares', function (Blueprint $table) {
            // Add a JSON column to store the array of names
            $table->json('teachers')->nullable()->after('principal_name');
        });
    }

    public function down(): void
    {
        Schema::table('daycares', function (Blueprint $table) {
            $table->dropColumn('teachers');
        });
    }
};
