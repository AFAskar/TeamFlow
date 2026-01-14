<?php

namespace Database\Seeders;

use App\Enums\InviteStatus;
use App\Enums\PriorityLevel;
use App\Enums\ProjectRole;
use App\Enums\Role;
use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\AuditLog;
use App\Models\Label;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\Team;
use App\Models\TeamInvite;
use App\Models\User;
use App\Models\UserTeam;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::factory()->create([
            'username' => 'admin',
            'email' => 'admin@example.com',
            'role' => Role::Admin,
        ]);

        // Create Manager User
        $manager = User::factory()->create([
            'username' => 'manager',
            'email' => 'manager@example.com',
            'role' => Role::Manager,
        ]);

        // Create Regular Members
        $members = User::factory(8)->create([
            'role' => Role::Member,
        ]);

        // Create Teams
        $team1 = Team::factory()->create([
            'name' => 'Development Team',
            'created_by' => $admin->id,
        ]);

        $team2 = Team::factory()->create([
            'name' => 'Marketing Team',
            'created_by' => $manager->id,
        ]);

        // Attach users to teams with roles
        UserTeam::create([
            'user_id' => $admin->id,
            'team_id' => $team1->id,
            'team_role' => TeamRole::Owner,
        ]);

        UserTeam::create([
            'user_id' => $manager->id,
            'team_id' => $team1->id,
            'team_role' => TeamRole::Admin,
        ]);

        foreach ($members->take(4) as $member) {
            UserTeam::create([
                'user_id' => $member->id,
                'team_id' => $team1->id,
                'team_role' => TeamRole::Member,
            ]);
        }

        UserTeam::create([
            'user_id' => $manager->id,
            'team_id' => $team2->id,
            'team_role' => TeamRole::Owner,
        ]);

        foreach ($members->skip(4) as $member) {
            UserTeam::create([
                'user_id' => $member->id,
                'team_id' => $team2->id,
                'team_role' => TeamRole::Member,
            ]);
        }

        // Create Projects
        $project1 = Project::factory()->create([
            'name' => 'Website Redesign',
            'team_id' => $team1->id,
            'created_by' => $admin->id,
        ]);

        $project2 = Project::factory()->create([
            'name' => 'Mobile App Development',
            'team_id' => $team1->id,
            'created_by' => $manager->id,
        ]);

        $project3 = Project::factory()->create([
            'name' => 'Marketing Campaign Q1',
            'team_id' => $team2->id,
            'created_by' => $manager->id,
        ]);

        // Attach members to projects
        ProjectMember::create([
            'project_id' => $project1->id,
            'user_id' => $admin->id,
            'role' => ProjectRole::Lead,
        ]);

        ProjectMember::create([
            'project_id' => $project1->id,
            'user_id' => $members[0]->id,
            'role' => ProjectRole::TechnicalLead,
        ]);

        ProjectMember::create([
            'project_id' => $project1->id,
            'user_id' => $members[1]->id,
            'role' => ProjectRole::Member,
        ]);

        // Create Labels
        $bugLabel = Label::factory()->create([
            'name' => 'Bug',
            'team_id' => $team1->id,
            'created_by' => $admin->id,
        ]);

        $featureLabel = Label::factory()->create([
            'name' => 'Feature',
            'team_id' => $team1->id,
            'created_by' => $admin->id,
        ]);

        $urgentLabel = Label::factory()->create([
            'name' => 'Urgent',
            'team_id' => $team1->id,
            'created_by' => $admin->id,
        ]);

        // Create Tasks
        $task1 = Task::factory()->create([
            'name' => 'Design homepage mockup',
            'project_id' => $project1->id,
            'status' => TaskStatus::InProgress,
            'priority' => PriorityLevel::High,
            'created_by' => $admin->id,
            'assigned_to' => $members[0]->id,
        ]);

        // Attach labels using TaskLabel model
        \App\Models\TaskLabel::create([
            'task_id' => $task1->id,
            'label_id' => $featureLabel->id,
        ]);

        \App\Models\TaskLabel::create([
            'task_id' => $task1->id,
            'label_id' => $urgentLabel->id,
        ]);

        $task2 = Task::factory()->create([
            'name' => 'Fix navigation bug',
            'project_id' => $project1->id,
            'status' => TaskStatus::Pending,
            'priority' => PriorityLevel::Critical,
            'created_by' => $manager->id,
            'assigned_to' => $members[1]->id,
        ]);

        \App\Models\TaskLabel::create([
            'task_id' => $task2->id,
            'label_id' => $bugLabel->id,
        ]);

        \App\Models\TaskLabel::create([
            'task_id' => $task2->id,
            'label_id' => $urgentLabel->id,
        ]);

        $task3 = Task::factory()->create([
            'name' => 'Write documentation',
            'project_id' => $project1->id,
            'status' => TaskStatus::Unplanned,
            'priority' => PriorityLevel::Low,
            'created_by' => $admin->id,
            'assigned_to' => null,
        ]);

        // Create subtask
        $subtask = Task::factory()->create([
            'name' => 'Create API documentation',
            'project_id' => $project1->id,
            'parent_id' => $task3->id,
            'status' => TaskStatus::Pending,
            'priority' => PriorityLevel::Medium,
            'created_by' => $admin->id,
            'assigned_to' => $members[0]->id,
        ]);

        // Create Task Comments
        $comment1 = TaskComment::factory()->create([
            'task_id' => $task1->id,
            'comment' => 'Great progress on this task!',
            'created_by' => $admin->id,
        ]);

        TaskComment::factory()->create([
            'task_id' => $task1->id,
            'comment' => 'Thanks! I should have the mockup ready by tomorrow.',
            'reply_to' => $comment1->id,
            'created_by' => $members[0]->id,
        ]);

        // Create Team Invites
        TeamInvite::factory()->create([
            'team_id' => $team1->id,
            'invitee_email' => 'newdev@example.com',
            'status' => InviteStatus::PENDING,
            'created_by' => $admin->id,
        ]);

        TeamInvite::factory()->create([
            'team_id' => $team2->id,
            'invitee_email' => null,
            'status' => InviteStatus::PENDING,
            'usage_limit' => 5,
            'created_by' => $manager->id,
        ]);

        // Create Audit Logs
        AuditLog::create([
            'action' => 'created',
            'entity_type' => 'Team',
            'entity_id' => $team1->id,
            'old_values' => null,
            'new_values' => ['name' => 'Development Team'],
            'done_by' => $admin->id,
            'done_at' => now(),
        ]);

        AuditLog::create([
            'action' => 'updated',
            'entity_type' => 'Task',
            'entity_id' => $task1->id,
            'old_values' => ['status' => 'Pending'],
            'new_values' => ['status' => 'In-Progress'],
            'done_by' => $members[0]->id,
            'done_at' => now(),
        ]);
    }
}
