-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

CREATE TABLE news_story_productions (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,

  -- Entropic token that follows a single news story through the phases of production
  -- This isn't a primary key that belongs to this table alone: it tracks several 1:1 and 1:n entities.
  news_story_token TEXT NOT NULL UNIQUE,

  -- The original URL for the news item
  original_news_canonical_url TEXT NOT NULL UNIQUE,

  -- The overall status of the news story.
  -- "not_ready", "ready_waiting", "processing", "retryably_failed", "permanently_failed", "skipped", "done"
  overall_production_status TEXT DEFAULT "not_ready" NOT NULL,

  -- Renditioning the audio with LLM/GPT
  -- "not_ready", "ready_waiting", "processing", "retryably_failed", "permanently_failed", "skipped", "done"
  llm_rendition_status TEXT DEFAULT "not_ready" NOT NULL,

  -- TTS for the audio with FakeYou
  -- "not_ready", "ready_waiting", "processing", "retryably_failed", "permanently_failed", "skipped", "done"
  audio_generation_status TEXT DEFAULT "not_ready" NOT NULL,

  -- Generating extra media (images, etc.)
  -- "not_ready", "ready_waiting", "processing", "retryably_failed", "permanently_failed", "skipped", "done"
  -- media_generation_status TEXT DEFAULT "not_ready" NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

  version INT DEFAULT 0 NOT NULL
);

CREATE INDEX index_overall_production_status ON news_story_productions(overall_production_status);
CREATE INDEX index_llm_rendition_status ON news_story_productions(llm_rendition_status);
CREATE INDEX index_audio_generation_status ON news_story_productions(audio_generation_status);
