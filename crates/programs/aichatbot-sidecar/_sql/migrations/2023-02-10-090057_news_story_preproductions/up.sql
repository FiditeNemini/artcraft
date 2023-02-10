-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

CREATE TABLE news_story_preproductions (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,

  -- TODO: Generic "story_token"
  -- Entropic token that follows a single news story through the phases of production
  -- This isn't a primary key that belongs to this table alone: it tracks several 1:1 and 1:n entities.
  news_story_token TEXT NOT NULL UNIQUE,

  -- The original URL for the news item
  original_news_canonical_url TEXT NOT NULL UNIQUE,

  -- If the source came from somewhere, this is it
  -- maybe_canonical_url TEXT NOT NULL UNIQUE,

  -- The name of the service used to generate TTS.
  -- I expect this will be FakeYou for a long time, but perhaps that will one day change.
  -- Enum-like value, eg. "fakeyou".
  tts_service TEXT NOT NULL,

  -- The identifier of the voice. For FakeYou, this is the tts_token.
  tts_voice_identifier TEXT NOT NULL,

  -- Original text of the TTS result
  full_text TEXT NOT NULL,

  -- For audio results, the URL to the result.
  maybe_result_url TEXT,

  -- For audio results that get downloaded, they live on the filesystem here
  -- This is relative to the runtime data directory.
  maybe_filesystem_relative_location TEXT,

  -- TTS render status: "new", "processing", "failed", "permanently_failed", "success", "skipped"
  news_story_production_status TEXT DEFAULT "new" NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- fetched_at DATETIME DEFAULT NULL,

  version INT DEFAULT 0 NOT NULL
);

CREATE INDEX index_news_story_production_status ON news_story_preproductions(news_story_production_status);
