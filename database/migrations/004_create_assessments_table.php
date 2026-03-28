<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Domains (Lookup Table)
        Schema::create('assessment_domains', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('max_score')->default(30);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Assessments (Main Table)
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('daycare_id')->constrained()->onDelete('cascade');

            $table->date('assessment_date');
            $table->string('assessment_type'); // "1st Assessment"

            // 👇 NEW: Form type to distinguish between 0-3y and 3-5y ECCD checklists
            $table->enum('form_type', ['record_1', 'record_2'])->default('record_2');

            $table->string('category')->nullable();
            $table->string('status')->default('Draft');
            $table->string('school_year')->nullable();
            $table->string('semester')->nullable();

            // Age Snapshot
            $table->integer('age_years')->nullable();
            $table->integer('age_months')->nullable();

            // Scores
            $table->integer('overall_score')->default(0); // Standard Score
            $table->integer('sum_of_scaled')->default(0); // Sum of Scaled Scores

            $table->string('overall_rating')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->date('next_assessment_date')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Scores (Detail Table)
        Schema::create('assessment_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments')->onDelete('cascade');
            $table->foreignId('domain_id')->constrained('assessment_domains')->onDelete('cascade');

            $table->decimal('score', 5, 2)->nullable(); // Raw
            $table->integer('scaled_score')->default(0); // Scaled
            $table->decimal('max_score', 5, 2)->nullable();
            $table->boolean('is_included')->default(true);

            $table->string('rating')->nullable();
            $table->text('notes')->nullable();
            $table->text('observations')->nullable();
            $table->text('skills_demonstrated')->nullable();
            $table->text('skills_emerging')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_scores');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('assessment_domains');
    }
};
