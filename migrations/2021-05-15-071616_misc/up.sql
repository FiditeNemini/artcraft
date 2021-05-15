# noinspection SqlNoDataSourceInspectionForFile
# noinspection SqlResolveForFile

-- Badges are rewards for loyalty
CREATE TABLE badges (
  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key"
  token CHAR(16) NOT NULL UNIQUE,

  -- Effective "primary key"
  slug CHAR(16) NOT NULL UNIQUE,

  -- Description
  title VARCHAR(255) NOT NULL,
  description VARCHAR(512) NOT NULL,
  image_url VARCHAR(512) NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- INDICES --
  PRIMARY KEY (id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Join table
CREATE TABLE user_badges (
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  user_token CHAR(16) NOT NULL UNIQUE,
  badge_token CHAR(16) NOT NULL UNIQUE,

  -- INDICES --
  PRIMARY KEY (id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
