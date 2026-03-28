<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 👇 NEW: 1. Sections (Schedule blocks like ITED, Session 1)
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daycare_id')->constrained('daycares')->onDelete('cascade');
            $table->string('name'); // e.g., "ITED", "Session 1"
            $table->enum('form_type', ['record_1', 'record_2'])->default('record_2');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->integer('capacity')->default(25);
            $table->timestamps();
        });

        // 2. Students
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daycare_id')->constrained('daycares')->onDelete('cascade');

            // 👇 NEW: Link student to a section
            $table->foreignId('section_id')->nullable()->constrained('sections')->onDelete('set null');

            $table->string('student_id')->unique()->nullable();
            $table->string('access_code')->unique()->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('nickname')->nullable();
            $table->date('date_of_birth');
            $table->string('gender');

            // Age Tracking
            $table->integer('age_years')->nullable();
            $table->integer('age_months')->nullable();

            $table->date('enrollment_date')->nullable();
            $table->date('expected_graduation_date')->nullable();
            $table->string('profile_photo')->nullable();
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // 3. Student-Parent Relationship
        Schema::create('student_parent', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');
            $table->string('relationship')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->string('status')->default('Pending');
            $table->timestamps();
            $table->unique(['student_id', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_parent');
        Schema::dropIfExists('students');
        // 👇 NEW: Drop sections table
        Schema::dropIfExists('sections');
    }
};
