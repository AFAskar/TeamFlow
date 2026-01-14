-- // Use DBML to define your database structure
-- // Docs: https://dbml.dbdiagram.io/docs


Table user_teams {
  id uuid [primary key]
  user_id uuid [ref: >users.id]
  team_id uuid [ref: >teams.id]
  team_role varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

  Indexes {
  (user_id, team_id) [unique]
  }
}

Table project_members{
  id uuid [primary key]
  project_id uuid [ref:> projects.id]
  user_id uuid [ref:> users.id]
  role varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp
  Indexes {
    (project_id, user_id) [unique]
  }

}

Table task_attachments{
  id uuid [primary key]
  user_id uuid [ref:>users.id]
  task_id uuid [ref:>tasks.id]
  s3_uri varchar
}
Table team_invites{
  id uuid [primary key]
  team_id uuid [ref:>teams.id]
  invitee_email varchar -- could be null if they used URLs instead of email
  expiry timestamp
  status varchar
  usage_limit integer
  used_count integer
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

  created_by uuid [ref:>users.id]

}

Table tasks{
  id uuid [primary key]
  name varchar
  project_id uuid [ref:> projects.id]
  description varchar
  status varchar
  priority varchar
  due_date timestamp
  position integer
  parent_id uuid [ref:>tasks.id]
  created_by uuid [ref: >users.id]
  assigned_to uuid [ref: >users.id]
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

}

Table task_comments{
  id uuid [primary key]
  task_id uuid [ref:>tasks.id]
  comment varchar
  reply_to uuid [ref:> task_comments.id]
  created_at timestamp
  created_by uuid [ref:>users.id]
  updated_at timestamp
  deleted_at timestamp

}

Table labels{
  id uuid [primary key]
  team_id uuid [ref:>teams.id]

  name varchar
  description varchar
  created_at timestamp
  created_by uuid [ref: >users.id]
  updated_at timestamp
  deleted_at timestamp

}

Table task_labels{
  id uuid [primary key]
  task_id uuid [ref:>tasks.id]
  label_id uuid [ref:> labels.id]
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

}

Table projects{
  id uuid [primary key]
  team_id uuid [ref:>teams.id]
  name varchar
  description varchar
  created_at timestamp
  created_by uuid [ref:> users.id]
  updated_at timestamp
  deleted_at timestamp

}


-- Just Follow the Laravel Default but Add Audit Logs, Soft Deletion and Roles
Table users {
  id uuid [primary key]
  username varchar
  role varchar
  email varchar [unique]
  email_verified_at timestamp
  password varchar
  remember_token varchar
  bio varchar
  avatar_token_url varchar
  created_at timestamp
  updated_at timestamp
  deleted_at timestamp

}

Table teams{
  id uuid [primary key]
  name varchar
  description varchar
  created_at timestamp
  created_by uuid [ref:> users.id]
  updated_at timestamp
  deleted_at timestamp

}

Table audit_log{
  id uuid [primary key]
  action varchar
  entity_type varchar
  entity_id uuid
  old_values json
  new_values json
  done_by uuid [ref:> users.id]
  done_at timestamp
}
