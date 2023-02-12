use crate::shared_state::job_state::JobState;
use crate::workers::web_content_scraping::single_target::filter_scraped_result_heuristics::filter_scraped_result_heuristics;
use crate::workers::web_content_scraping::single_target::ingest_url_scrape_and_save::ingest_url_scrape_and_save;
use enums::by_table::web_scraping_targets::scraping_status::ScrapingStatus;
use errors::AnyhowResult;
use log::error;
use sqlite_queries::queries::by_table::news_story_productions::insert_news_story_production::Args as ProductionArgs;
use sqlite_queries::queries::by_table::news_story_productions::insert_news_story_production::insert_news_story_production;
use sqlite_queries::queries::by_table::web_rendition_targets::insert_web_rendition_target::Args as RenditionArgs;
use sqlite_queries::queries::by_table::web_rendition_targets::insert_web_rendition_target::insert_web_rendition_target;
use sqlite_queries::queries::by_table::web_scraping_targets::list_web_scraping_targets::WebScrapingTarget as WebScrapingTargetRecord;
use sqlite_queries::queries::by_table::web_scraping_targets::update_web_scraping_target::Args as ScrapingArgs;
use sqlite_queries::queries::by_table::web_scraping_targets::update_web_scraping_target::update_web_scraping_target;
use std::sync::Arc;
use tokens::tokens::news_stories::NewsStoryToken;

pub async fn process_target_record(target: &WebScrapingTargetRecord, job_state: &Arc<JobState>) -> AnyhowResult<()> {
  let result = ingest_url_scrape_and_save(
    &target.canonical_url,
    target.web_content_type,
    &job_state.save_directory).await;

  match result {
    Err(err) => {
      error!("error ingesting url: {:?}", err);

      let next_scraping_status = next_status(target.scrape_attempts);

      update_web_scraping_target(ScrapingArgs {
        canonical_url: &target.canonical_url,
        scraping_status: next_scraping_status,
        scrape_attempts: target.scrape_attempts + 1,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck.

      Err(err)
    },
    Ok(None) => {
      // Nothing was scraped.
      let next_scraping_status = next_status(target.scrape_attempts);

      update_web_scraping_target(ScrapingArgs {
        canonical_url: &target.canonical_url,
        scraping_status: next_scraping_status,
        scrape_attempts: target.scrape_attempts + 1,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck.

      Ok(())
    },
    Ok(Some(result)) => {
      update_web_scraping_target(ScrapingArgs {
        canonical_url: &target.canonical_url,
        scraping_status: ScrapingStatus::Success,
        scrape_attempts: target.scrape_attempts + 1,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck.

      let maybe_skip_reason = filter_scraped_result_heuristics(&result)
          .await?;

      insert_web_rendition_target( RenditionArgs {
        canonical_url: &target.canonical_url,
        web_content_type: target.web_content_type,
        sqlite_pool: &job_state.sqlite_pool,
        maybe_skip_reason,
      }).await?; // NB: If these queries fail, we could get stuck.

      let news_story_token = NewsStoryToken::generate();

      insert_news_story_production(ProductionArgs {
        news_story_token: &news_story_token,
        original_news_canonical_url: &target.canonical_url,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?;

      Ok(())
    },
  }
}

fn next_status(scrape_attempts: i64) -> ScrapingStatus {
  if scrape_attempts >= 2 {
    ScrapingStatus::PermanentlyFailed
  } else {
    ScrapingStatus::Failed
  }
}
