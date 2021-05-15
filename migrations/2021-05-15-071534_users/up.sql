# noinspection SqlNoDataSourceInspectionForFile
# noinspection SqlResolveForFile

CREATE TABLE users (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Effective "primary key"
  token CHAR(16) NOT NULL UNIQUE,

  email_address VARCHAR(255) NOT NULL UNIQUE,
  email_confirmed BOOLEAN NOT NULL DEFAULT false,

  -- Username is a lookup key; display_name allows the user to add custom case.
  username VARCHAR(20) NOT NULL UNIQUE,
  display_name VARCHAR(20) NOT NULL,

  -- The profile of the user in markdown (user editable).
  profile_markdown TEXT NOT NULL,

  -- Generated HTML (not user-editable).
  profile_rendered_html TEXT NOT NULL,

  -- The role assigned to the user confers permissions.
  user_role_slug VARCHAR(16) NOT NULL,

  -- Bcrypt password hash. Granted, there are newer methods:
  -- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  -- Passwords may be a max of 64 characters per BCrypt.
  password_hash BINARY(60) NOT NULL,

  -- Incremented with every update to the password.
  password_version INT NOT NULL DEFAULT 0,

  -- Different than deleted.
  -- Users still show up, but can't do anything.
  banned BOOLEAN NOT NULL DEFAULT false,

  -- For abuse tracking.
  ip_address_creation VARCHAR(20) NOT NULL,
  ip_address_last_login VARCHAR(20) NOT NULL,
  ip_address_last_update VARCHAR(20) NOT NULL,

  -- For tracking stats.
  -- The "cached" values are updated by a background job.
  cached_tts_rendered_counter INT(10) NOT NULL DEFAULT 0,
  cached_w2l_rendered_counter INT(10) NOT NULL DEFAULT 0,

  -- Settings
  -- DO NOT REORDER.
  dark_mode ENUM(
    'light-mode',
    'dark-mode',
    'use-clock'
  ) NOT NULL DEFAULT 'light-mode',

  -- An uploaded avatar. Public hash in our bucket.
  avatar_public_bucket_hash CHAR(32) NOT NULL UNIQUE,

  -- If the user doesn't want to use gravatar and doesn't have an uploaded avatar.
  disable_gravatar BOOLEAN NOT NULL DEFAULT false,

  -- Hide results from others (ie. won't show up in the wall)
  -- Moderators will still see them.
  -- If the URLs are shared, they'll be visible.
  hide_results_preference BOOLEAN NOT NULL DEFAULT false,

  -- Incremented with every update.
  version INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- If the user is deleted, we set this.
  -- This is different than banned. These users won't show up at all.
  deleted_at TIMESTAMP NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE user_roles (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Effective "primary key"
  slug CHAR(16) NOT NULL UNIQUE,

  name VARCHAR(255) NOT NULL,

  can_ban_users BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit_other_users_data BOOLEAN NOT NULL DEFAULT FALSE,

  can_upload_tts_models BOOLEAN NOT NULL DEFAULT FALSE,
  can_upload_w2l_templates BOOLEAN NOT NULL DEFAULT FALSE,

  can_use_tts BOOLEAN NOT NULL DEFAULT FALSE,
  can_use_w2l BOOLEAN NOT NULL DEFAULT FALSE,

  -- Incremented with every update.
  version INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE user_sessions (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Session entropy
  token CHAR(32) NOT NULL,

  -- Foreign key to user
  user_token CHAR(16) NOT NULL,

  -- Track each session's creation IP.
  ip_address_creation VARCHAR(20) NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- deletion = session termination
  deleted_at TIMESTAMP NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- We only allow the most recent record for any given user to be redeemed.
CREATE TABLE email_verifications (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  verification_type ENUM(
    'email-verification',
    'password-reset'
  ) NOT NULL,

  -- The redemption secret
  verification_code VARCHAR(32) NOT NULL,

  -- Whether the attempt worked
  successful BOOLEAN NOT NULL DEFAULT false,

    -- Foreign key to user
  user_token CHAR(16) NOT NULL,

  -- Cannot be redeemed after this date
  expires_at TIMESTAMP NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
