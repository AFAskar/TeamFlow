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
        Schema::create('task_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_id');
            $table->text('comment');
            $table->uuid('reply_to')->nullable();
            $table->uuid('created_by');
            $table->foreign('task_id')->references('id')->on('tasks')->cascadeOnDelete();
            // $table->foreign('reply_to')->references('id')->on('task_comments')->nullOnDelete(); // Moved to separate call
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('task_comments', function (Blueprint $table) {
            $table->foreign('reply_to')->references('id')->on('task_comments')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_comments');
    }
};
