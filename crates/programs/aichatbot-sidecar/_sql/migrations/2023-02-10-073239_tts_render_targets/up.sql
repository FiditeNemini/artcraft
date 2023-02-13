-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- NB: These tables are designed for sqlite, not MySQL!

CREATE TABLE tts_render_targets (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,

  -- Composite primary key for what this TTS render job belongs to (eg. news story)
  story_type TEXT NOT NULL,
  story_token TEXT NOT NULL,

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
  tts_render_status TEXT DEFAULT "new" NOT NULL,
  tts_render_attempts INT DEFAULT 0 NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- fetched_at DATETIME DEFAULT NULL,

  version INT DEFAULT 0 NOT NULL
);

CREATE INDEX index_tts_render_status ON tts_render_targets(tts_render_status);
CREATE INDEX index_tts_render_foreign_key ON tts_render_targets(story_type, story_token);
