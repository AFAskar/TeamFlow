<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamInviteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified', 'throttle:api'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Teams
    Route::resource('teams', TeamController::class);
    Route::post('teams/{team}/leave', [TeamController::class, 'leave'])->name('teams.leave');
    Route::post('teams/{team}/transfer-ownership', [TeamController::class, 'transferOwnership'])->name('teams.transfer-ownership');
    Route::patch('teams/{team}/members/role', [TeamController::class, 'updateMemberRole'])->name('teams.members.update-role');
    Route::delete('teams/{team}/members', [TeamController::class, 'removeMember'])->name('teams.members.remove');
    Route::get('teams/{team}/dashboard', [DashboardController::class, 'teamDashboard'])->name('teams.dashboard');

    // Team Invites - with stricter rate limiting
    Route::middleware('throttle:invites')->group(function () {
        Route::get('invites', [TeamInviteController::class, 'myInvites'])->name('invites.index');
        Route::get('teams/{teamId}/invites', [TeamInviteController::class, 'index'])->name('team-invites.index');
        Route::post('team-invites', [TeamInviteController::class, 'store'])->name('team-invites.store');
        Route::get('team-invites/{invite}', [TeamInviteController::class, 'show'])->name('team-invites.show');
        Route::post('invites/{invite}/accept', [TeamInviteController::class, 'accept'])->name('invites.accept');
        Route::post('invites/{invite}/reject', [TeamInviteController::class, 'decline'])->name('invites.reject');
        Route::post('team-invites/{invite}/revoke', [TeamInviteController::class, 'revoke'])->name('team-invites.revoke');
    });

    // Projects
    Route::resource('projects', ProjectController::class);
    Route::post('projects/{id}/restore', [ProjectController::class, 'restore'])->name('projects.restore');
    Route::post('projects/{project}/members', [ProjectController::class, 'addMember'])->name('projects.members.add');
    Route::delete('projects/{project}/members', [ProjectController::class, 'removeMember'])->name('projects.members.remove');
    Route::get('projects/{project}/kanban', [ProjectController::class, 'kanban'])->name('projects.kanban');

    // Tasks
    Route::get('my-tasks', [TaskController::class, 'myTasks'])->name('tasks.my-tasks');
    Route::resource('tasks', TaskController::class);
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');
    Route::put('tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::post('tasks/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');

    // Task Comments - with comments rate limiting
    Route::middleware('throttle:comments')->group(function () {
        Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store'])->name('tasks.comments.store');
        Route::post('task-comments', [TaskCommentController::class, 'store'])->name('task-comments.store');
        Route::patch('task-comments/{comment}', [TaskCommentController::class, 'update'])->name('task-comments.update');
        Route::delete('task-comments/{comment}', [TaskCommentController::class, 'destroy'])->name('task-comments.destroy');
    });

    // Task Attachments - with uploads rate limiting
    Route::middleware('throttle:uploads')->group(function () {
        Route::post('task-attachments', [TaskAttachmentController::class, 'store'])->name('task-attachments.store');
    });
    Route::get('task-attachments/{attachment}/download', [TaskAttachmentController::class, 'download'])->name('task-attachments.download');
    Route::delete('task-attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])->name('task-attachments.destroy');

    // Labels
    Route::get('teams/{teamId}/labels', [LabelController::class, 'index'])->name('labels.index');
    Route::post('labels', [LabelController::class, 'store'])->name('labels.store');
    Route::patch('labels/{label}', [LabelController::class, 'update'])->name('labels.update');
    Route::delete('labels/{label}', [LabelController::class, 'destroy'])->name('labels.destroy');
});

require __DIR__.'/settings.php';
