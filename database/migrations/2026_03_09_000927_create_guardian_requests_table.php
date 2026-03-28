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
        Schema::create('guardian_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // The Parent
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete(); // The Child
            $table->string('birth_cert_path'); // Where the file is stored
            $table->string('parent_id_path'); // Where the file is stored
            $table->string('status')->default('Pending'); // Pending, Approved, or Denied
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guardian_requests');
    }
};
