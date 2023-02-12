use async_openai::Client;
use async_openai::types::CreateCompletionRequestArgs;
use crate::persistence::rendition_data::RenditionData;
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::job_state::JobState;
use crate::workers::news_stories::news_story_llm_rendition::gpt_prompts::news_article_prompt::NewsArticlePrompt;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use errors::AnyhowResult;
use log::{error, info};
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_llm_rendition_status::{Args, update_news_story_llm_rendition_status};
use std::sync::Arc;
use web_scrapers::payloads::web_scraping_result::ScrapedWebArticle;

pub async fn process_single_item(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  let scraping_result = load_scraped_result(
    &target.original_news_canonical_url,
    &job_state.save_directory).await?;

  let prompt = NewsArticlePrompt::new(&scraping_result.paragraphs);
  let prompt = prompt.make_prompt();

  let rendition_result = call_openai_gpt(
    &target.original_news_canonical_url,
    &prompt,
    &job_state.openai_client
  ).await;

  let llm_rendition_attempts = target.llm_rendition_attempts + 1;

  let rendition_data = match rendition_result {
    Err(err) => {
      error!("Error using GPT: {:?}", err);

//      let next_rendition_status = next_status(target.llm_rendition_attempts);
//
//      update_web_rendition_target(Args {
//        canonical_url: &target.original_news_canonical_url,
//        rendition_status: next_rendition_status,
//        rendition_attempts: target.llm_rendition_attempts + 1,
//        sqlite_pool: &job_state.sqlite_pool,
//      }).await?; // NB: If these queries fail, we could get stuck.

      update_news_story_llm_rendition_status(Args {
        news_story_token: &target.news_story_token,
        is_successful: false,
        llm_rendition_attempts,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck in retry hell.

      return Err(err);
    }
    Ok(rendition_data) => rendition_data,
  };

  update_news_story_llm_rendition_status(Args {
    news_story_token: &target.news_story_token,
    is_successful: true,
    llm_rendition_attempts,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?; // NB: If these queries fail, we could get stuck in retry hell.

//  update_web_rendition_target(Args {
//    canonical_url: &target.original_news_canonical_url,
//    rendition_status: RenditionStatus::Success,
//    rendition_attempts: target.llm_rendition_attempts + 1,
//    sqlite_pool: &job_state.sqlite_pool,
//  }).await?; // NB: If these queries fail, we could get stuck.

  {
    let yaml_filename = job_state.save_directory
        .rendition_file_for_webpage_url(&target.original_news_canonical_url)?;
    let mut file = std::fs::File::create(&yaml_filename)?;
    serde_yaml::to_writer(file, &rendition_data)?;
  }

  Ok(())
}

async fn load_scraped_result(url: &str, save_directory: &SaveDirectory) -> AnyhowResult<ScrapedWebArticle> {
  let scrape_yaml_filename = save_directory.scrape_summary_file_for_webpage_url(url)?;
  let mut file = std::fs::File::open(&scrape_yaml_filename)?;
  let scraping_result : ScrapedWebArticle = serde_yaml::from_reader(file)?;
  Ok(scraping_result)
}

async fn call_openai_gpt(url: &str, prompt: &str, openai_client: &Arc<Client>) -> AnyhowResult<RenditionData> {
  let request = CreateCompletionRequestArgs::default()
      .model("text-davinci-003")
      .prompt(prompt)
      .max_tokens(1200_u16)
      .build()?;

  let response = openai_client
      .completions()
      .create(request)
      .await?;

  info!("Open AI response: {:?}", response);

  let rendition_text = response.choices.get(0)
      .map(|option| option.text.clone())
      .unwrap_or("".to_string());

  Ok(RenditionData {
    original_content_url: url.to_string(),
    original_prompt: prompt.to_string(),
    response: rendition_text,
  })
}

//fn next_status(rendition_attempts: i64) -> RenditionStatus {
//  if rendition_attempts >= 2 {
//    RenditionStatus::PermanentlyFailed
//  } else {
//    RenditionStatus::Failed
//  }
//}
