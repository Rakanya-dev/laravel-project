<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // --- GROUP 1: CORE TABLES (No Dependencies) ---

        Schema::create('daycares', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address');
            $table->string('city');
            $table->string('province');
            $table->string('postal_code');
            $table->string('phone');
            $table->string('email');
            $table->string('principal_name');
            $table->string('license_number')->nullable();
            $table->integer('capacity')->nullable();
            $table->integer('current_enrollment')->default(0);
            $table->string('status')->default('active');
            $table->date('established_date')->nullable();
            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('assessment_domains', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('report_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->longText('content');
            $table->string('type');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // --- GROUP 2: PRIMARY MODELS (Depend on Group 1) ---

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daycare_id')->nullable()->constrained('daycares')->nullOnDelete();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->comment('admin, teacher, parent');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('phone');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('profile_photo')->nullable();
            $table->string('status')->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daycare_id')->constrained('daycares')->onDelete('cascade');
            $table->string('student_id')->unique()->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('nickname')->nullable();
            $table->date('date_of_birth');
            $table->string('gender');
            $table->integer('age_years')->nullable();
            $table->integer('age_months')->nullable();
            $table->string('blood_type')->nullable();
            $table->string('profile_photo')->nullable();
            $table->date('admission_date')->nullable();
            $table->string('status')->default('active');
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('medications')->nullable();
            $table->text('special_needs')->nullable();
            $table->text('dietary_restrictions')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // --- GROUP 3: SECONDARY MODELS (Depend on Groups 1 & 2) ---

        // --- THIS IS THE NEW TABLE ---
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });
        // -----------------------------

        Schema::create('student_parent', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');
            $table->string('relationship')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('can_pickup')->default(false);
            $table->timestamps();
            $table->unique(['student_id', 'parent_id']);
        });

        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('daycare_id')->constrained('daycares')->onDelete('cascade');
            $table->date('assessment_date');
            $table->string('assessment_type')->nullable();
            $table->string('school_year')->nullable();
            $table->string('semester')->nullable();
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->string('overall_rating')->nullable();
            $table->text('overall_notes')->nullable();
            $table->text('recommendations')->nullable();
            $table->text('teacher_comments')->nullable();
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('parent_viewed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->date('attendance_date');
            $table->enum('status', ['present', 'absent', 'late', 'excused']);
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('checked_out_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->date('record_date');
            $table->string('record_type')->comment('e.g., checkup, vaccination, incident');
            $table->text('description');
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('parent_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');
            $table->date('note_date');
            $table->string('subject');
            $table->text('content');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('users')->onDelete('cascade');
            $table->string('subject')->nullable();
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->string('report_type');
            $table->date('report_date');
            $table->longText('content');
            $table->string('file_path')->nullable();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('activity');
            $table->string('loggable_type')->nullable();
            $table->unsignedBigInteger('loggable_id')->nullable();
            $table->text('description')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->index(['loggable_type', 'loggable_id']);
        });

        // --- GROUP 4: TERTIARY MODELS (Depend on Group 3) ---

        Schema::create('assessment_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments')->onDelete('cascade');
            $table->foreignId('domain_id')->constrained('assessment_domains')->onDelete('cascade');
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->nullable();
            $table->string('rating')->nullable();
            $table->text('notes')->nullable();
            $table->text('observations')->nullable();
            $table->text('skills_demonstrated')->nullable();
            $table->text('skills_emerging')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order of creation
        Schema::dropIfExists('assessment_scores');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('parent_notes');
        Schema::dropIfExists('medical_records');
        Schema::dropIfExists('attendance');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('student_parent');
        Schema::dropIfExists('sessions'); // <-- ADDED THIS
        Schema::dropIfExists('cache'); // <-- ADD THIS LINE
        Schema::dropIfExists('students');
        Schema::dropIfExists('users');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('report_templates');
        Schema::dropIfExists('assessment_domains');
        Schema::dropIfExists('daycares');
    }
};
