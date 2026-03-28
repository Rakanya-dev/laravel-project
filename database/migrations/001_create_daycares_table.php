<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('daycares', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address');
            $table->string('city');
            $table->string('province');
            $table->string('postal_code')->nullable();
            $table->string('phone');
            $table->string('email');
            $table->string('principal_name')->nullable();
            $table->string('license_number')->nullable();
            $table->integer('capacity')->nullable();
            $table->integer('current_enrollment')->default(0);
            $table->string('status')->default('active');
            $table->date('established_date')->nullable();
            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daycares');
    }
};
