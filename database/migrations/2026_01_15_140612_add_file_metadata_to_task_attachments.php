<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('task_attachments', function (Blueprint $table) {
            $table->string('filename')->after('s3_uri');
            $table->string('original_filename')->after('filename');
            $table->string('mime_type')->after('original_filename');
            $table->unsignedBigInteger('size')->after('mime_type');
            $table->string('disk')->default('public')->after('size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_attachments', function (Blueprint $table) {
            $table->dropColumn(['filename', 'original_filename', 'mime_type', 'size', 'disk']);
        });
    }
};
