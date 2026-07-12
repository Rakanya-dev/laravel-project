<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            // 🚀 The magic 'change()' method alters the existing column
            $table->integer('sum_of_scaled')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            // Reverts it back to NOT NULL if you ever rollback
            $table->integer('sum_of_scaled')->nullable(false)->change();
        });
    }
};
