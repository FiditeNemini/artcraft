-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- NB: These tables are designed for sqlite, not MySQL!

CREATE TABLE web_rendition_targets (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,

  -- Canonical URLs help us avoid aliases of the same content.
  -- We'll need to figure this out for each site.
  canonical_url TEXT NOT NULL UNIQUE,

  -- TODO: Once we have more types of content being ingested and more output modalities:
  -- Effectively an enum-like: NewsArticle, WritingPrompt, SocialMediaDiscussion,  etc.
  -- This controls the template that we use to query against GPT / LLM.
  -- rephrasing_type TEXT NOT NULL,

  -- Effectively an enum-like: CnnArticle, SlashdotArticle, HackerNewsThread, etc.
  web_content_type TEXT NOT NULL,

  -- Scraping status: "new", "failed", "permanently_failed", "success"
  rendition_status TEXT DEFAULT "new" NOT NULL,
  rendition_attempts INT DEFAULT 0 NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

  version INT DEFAULT 0 NOT NULL
);

CREATE INDEX index_rendition_status ON web_rendition_targets(rendition_status);
