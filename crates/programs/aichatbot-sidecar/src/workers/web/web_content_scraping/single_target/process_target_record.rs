use crate::shared_state::job_state::JobState;
use crate::workers::web::web_content_scraping::single_target::filter_scraped_result_heuristics::filter_scraped_result_heuristics;
use crate::workers::web::web_content_scraping::single_target::ingest_url_scrape_and_save::ingest_url_scrape_and_save;
use enums::by_table::web_scraping_targets::scraping_status::ScrapingStatus;
use errors::AnyhowResult;
use log::error;
use sqlite_queries::queries::by_table::news_story_productions::insert_news_story_production::Args as ProductionArgs;
use sqlite_queries::queries::by_table::news_story_productions::insert_news_story_production::insert_news_story_production;
use sqlite_queries::queries::by_table::web_scraping_targets::list::web_scraping_target::WebScrapingTarget as WebScrapingTargetRecord;
use sqlite_queries::queries::by_table::web_scraping_targets::update_web_scraping_target::Args as ScrapingArgs;
use sqlite_queries::queries::by_table::web_scraping_targets::update_web_scraping_target::update_web_scraping_target;
use std::sync::Arc;
use tokens::tokens::news_stories::NewsStoryToken;

pub async fn process_target_record(target: &WebScrapingTargetRecord, job_state: &Arc<JobState>) -> AnyhowResult<()> {
  let result = ingest_url_scrape_and_save(
    &target.canonical_url,
    target.web_content_type,
    &job_state.save_directory).await;

  let scrape_attempts = target.scrape_attempts + 1;

  match result {
    Err(err) => {
      error!("error ingesting url: {:?}", err);

      let next_scraping_status = next_status(target.scrape_attempts);

      update_web_scraping_target(ScrapingArgs {
        canonical_url: &target.canonical_url,
        scraping_status: next_scraping_status,
        scrape_attempts,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck.

      Err(err)
    },
    Ok(None) => {
      error!("nothing was scraped from url: {:?}", &target.canonical_url);

      // Nothing was scraped.
      let next_scraping_status = next_status(target.scrape_attempts);

      update_web_scraping_target(ScrapingArgs {
        canonical_url: &target.canonical_url,
        scraping_status: next_scraping_status,
        scrape_attempts,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck.

      Ok(())
    },
    Ok(Some(result)) => {
      update_web_scraping_target(ScrapingArgs {
        canonical_url: &target.canonical_url,
        scraping_status: ScrapingStatus::Success,
        scrape_attempts,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck.

      let maybe_skip_reason = filter_scraped_result_heuristics(&result)
          .await?;

      let news_story_token = NewsStoryToken::generate();

      insert_news_story_production(ProductionArgs {
        news_story_token: &news_story_token,
        original_news_canonical_url: &target.canonical_url,
        web_content_type: target.web_content_type,
        original_news_title: target.maybe_title.as_deref().unwrap_or(""),
        // maybe_skip_reason, // TODO: Should I do this?
        sqlite_pool: &job_state.sqlite_pool,
      }).await?;

      Ok(())
    },
  }
}

fn next_status(scrape_attempts: i64) -> ScrapingStatus {
  if scrape_attempts > 2 {
    ScrapingStatus::PermanentlyFailed
  } else {
    ScrapingStatus::Failed
  }
}
