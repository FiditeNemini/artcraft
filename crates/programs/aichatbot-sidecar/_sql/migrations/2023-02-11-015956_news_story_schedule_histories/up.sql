-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

CREATE TABLE news_story_schedule_histories (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,

  -- We can have many entries for the same news story.
  news_story_token TEXT NOT NULL,

  -- Records when the story was played.
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX index_news_story_token ON news_story_schedule_histories(news_story_token);
CREATE INDEX played_at ON news_story_schedule_histories(played_at);
