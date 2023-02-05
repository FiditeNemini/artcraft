-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- NB: These tables are designed for sqlite, not MySQL!

CREATE TABLE web_scraping_targets (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,

  -- Effectively an enum-like: CnnArticle, SlashdotArticle, HackerNewsThread, etc.
  web_content_type TEXT NOT NULL,

  -- Canonical URLs help us avoid aliases of the same content.
  -- We'll need to figure this out for each site.
  canonical_url TEXT NOT NULL UNIQUE,

  -- Scraping status: "new", "failed", "permanently_failed", "success"
  scraping_status TEXT DEFAULT "new" NOT NULL,
  scrape_attempts INT NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX index_scraping_status ON web_scraping_targets(scraping_status);
