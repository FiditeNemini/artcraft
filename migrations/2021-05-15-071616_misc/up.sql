# noinspection SqlNoDataSourceInspectionForFile
# noinspection SqlResolveForFile

-- Badges are rewards for loyalty
CREATE TABLE badges (
  -- Not used for anything except replication.
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,

  -- Effective "primary key"
  token CHAR(16) NOT NULL UNIQUE,

  -- Effective "primary key"
  slug CHAR(16) NOT NULL UNIQUE,

  -- Description
  title VARCHAR(255) NOT NULL,
  description VARCHAR(512) NOT NULL,
  image_url VARCHAR(512) NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

) ENGINE=INNODB;

-- Join table
CREATE TABLE user_badges (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_token CHAR(16) NOT NULL UNIQUE,
  badge_token CHAR(16) NOT NULL UNIQUE
) ENGINE=INNODB;
