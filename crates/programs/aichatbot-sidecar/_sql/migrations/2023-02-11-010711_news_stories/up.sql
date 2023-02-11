-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

CREATE TABLE news_stories (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,

  -- Entropic token that follows a single news story through the phases of production
  -- This isn't a primary key that belongs to this table alone: it tracks several 1:1 and 1:n entities.
  news_story_token TEXT NOT NULL UNIQUE,

  -- The original URL for the news item
  original_news_canonical_url TEXT NOT NULL UNIQUE,

  -- When the story should stop being scheduled.
  replayable_until DATETIME NOT NULL,

  -- A kill switch for news stories.
  is_playable BOOLEAN NOT NULL DEFAULT FALSE,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- fetched_at DATETIME DEFAULT NULL,

  version INT DEFAULT 0 NOT NULL
);

CREATE INDEX index_replayable_until ON news_stories(replayable_until);
CREATE INDEX index_is_playable ON news_stories(is_playable);
