use async_openai::Client;
use async_openai::types::CreateCompletionRequestArgs;
use crate::persistence::rendition_data::RenditionData;
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::job_state::JobState;
use crate::workers::news_stories::news_story_llm_rendition::gpt_prompts::news_article_prompt::NewsArticlePrompt;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use errors::{anyhow, AnyhowResult};
use log::{error, info, warn};
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_llm_rendition_status::{Args, update_news_story_llm_rendition_status};
use std::sync::Arc;
use async_openai::error::OpenAIError;
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

      match &err {
        WrappedOpenAiError::Other(_) => {}
        WrappedOpenAiError::OpenAiError(inner) => {
          match inner {
            OpenAIError::Reqwest(e) => { error!("Request error: {:?}", e) }
            OpenAIError::ApiError(e) => { error!("API error: {:?}", e) }
            OpenAIError::JSONDeserialize(e) => { error!("JSON error: {:?}", e) }
            OpenAIError::FileSaveError(e) => { error!("File save error: {:?}", e) }
            OpenAIError::FileReadError(e) => { error!("File read error: {:?}", e) }
            OpenAIError::StreamError(e) => { error!("Stream error: {:?}", e) }
            OpenAIError::InvalidArgument(e) => { error!("Invalid args error: {:?}", e) }
          }
        }
      }

      update_news_story_llm_rendition_status(Args {
        news_story_token: &target.news_story_token,
        is_successful: false,
        llm_rendition_attempts,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck in retry hell.

      return Err(anyhow!("OpenAI Rendition Error: {:?}", err));
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
    rendition_data.write_to_yaml_file(yaml_filename)?;
  }

  Ok(())
}

async fn load_scraped_result(url: &str, save_directory: &SaveDirectory) -> AnyhowResult<ScrapedWebArticle> {
  let scrape_yaml_filename = save_directory.scrape_summary_file_for_webpage_url(url)?;
  let mut file = std::fs::File::open(&scrape_yaml_filename)?;
  let scraping_result : ScrapedWebArticle = serde_yaml::from_reader(file)?;
  Ok(scraping_result)
}

#[derive(Debug)]
pub enum WrappedOpenAiError {
  OpenAiError(OpenAIError),
  Other(String),
}

async fn call_openai_gpt(url: &str, prompt: &str, openai_client: &Arc<Client>) -> Result<RenditionData, WrappedOpenAiError> {
  warn!("Building OpenAI Request...");
  let request = CreateCompletionRequestArgs::default()
      .model("text-davinci-003")
      .prompt(prompt)
      .max_tokens(2500_u16)
      .build()
      .map_err(|err| {
        error!("Error building request: {:?}", err);
        WrappedOpenAiError::Other(format!("error: {:?}",  err))
      })?;

  warn!("Making OpenAI Request...");
  let response = openai_client
      .completions()
      .create(request)
      .await
      .map_err(|err| {
        error!("OpenAI Error: {:?}", err);
        WrappedOpenAiError::OpenAiError(err)
      })?;

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
