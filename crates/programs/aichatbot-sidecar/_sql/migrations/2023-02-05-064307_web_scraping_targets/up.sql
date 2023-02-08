-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- NB: These tables are designed for sqlite, not MySQL!

CREATE TABLE web_scraping_targets (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,

  -- Canonical URLs help us avoid aliases of the same content.
  -- We'll need to figure this out for each site.
  canonical_url TEXT NOT NULL UNIQUE,

  -- Effectively an enum-like: CnnArticle, SlashdotArticle, HackerNewsThread, etc.
  web_content_type TEXT NOT NULL,

  -- Optional title of the target, which might help downstream.
  maybe_title TEXT,

  -- A full image will only be set at this stage if the RSS feed or HTML specifies one.
  -- This can be useful downstream during the actual scraping.
  maybe_article_full_image_url TEXT,

  -- A thumbnail will only be set at this stage if the RSS feed or HTML specifies one.
  -- This can be useful downstream during the actual scraping.
  maybe_article_thumbnail_image_url TEXT,

  -- If we skip the target (a priori or after scraping), this is why.
  -- Enum-like value, eg. "predominantly_video", "empty", "filtered_topic", "nobody_cares", etc.
  maybe_skip_reason TEXT,

  -- Scraping status: "new", "failed", "permanently_failed", "success", "skipped"
  scraping_status TEXT DEFAULT "new" NOT NULL,
  scrape_attempts INT DEFAULT 0 NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- fetched_at DATETIME DEFAULT NULL,

  version INT DEFAULT 0 NOT NULL
);

CREATE INDEX index_scraping_status ON web_scraping_targets(scraping_status);
