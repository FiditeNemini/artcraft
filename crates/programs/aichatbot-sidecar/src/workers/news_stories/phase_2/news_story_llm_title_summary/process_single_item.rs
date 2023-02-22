use async_openai::Client;
use async_openai::error::OpenAIError;
use async_openai::types::CreateCompletionRequestArgs;
use crate::gpt_prompts::concise_title_gpt_prompt::ConciseTitleGptPrompt;
use crate::persistence::load_scraped_result::load_scraped_result;
use crate::persistence::rendition_data::RenditionData;
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::job_state::JobState;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use errors::{anyhow, AnyhowResult};
use log::{error, info, warn};
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_llm_title_summary_status::Args;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_llm_title_summary_status::update_news_story_llm_title_summary_status;
use std::sync::Arc;
use web_scrapers::payloads::web_scraping_result::ScrapedWebArticle;

pub async fn process_single_item(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  let scraping_result = load_scraped_result(
    &target.original_news_canonical_url,
    &job_state.save_directory).await?;

  let prompt = ConciseTitleGptPrompt::new(
    scraping_result.maybe_title.as_deref().unwrap_or("Article"),
    &scraping_result.paragraphs);

  let prompt = prompt.make_prompt();

  let rendition_result = call_openai_gpt(
    &target.original_news_canonical_url,
    &prompt,
    &job_state.openai_client
  ).await;

  let llm_title_summary_attempts = target.llm_title_summary_attempts + 1;

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

      update_news_story_llm_title_summary_status(Args {
        news_story_token: &target.news_story_token,
        is_successful: false,
        maybe_title_summary: None,
        llm_title_summary_attempts,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?; // NB: If these queries fail, we could get stuck in retry hell.

      return Err(anyhow!("OpenAI Rendition Error for {}: {:?}", target.news_story_token, err));
    }

    Ok(rendition_data) => rendition_data,
  };

  let title_summary = rendition_data.response.trim();

  // NB: GPT often completes the prompt we used itself, so we grab the last line (presumably output)
  let title_summary = title_summary.split("\n")
      .map(|line| line.trim().to_string())
      .filter(|line| line.len() > 5)
      .last()
      .unwrap_or("".to_string());

  // NB: GPT often includes quotes in the output.
  let title_summary = title_summary.replace("\"", "");

  if title_summary.len() < 5 {
    update_news_story_llm_title_summary_status(Args {
      news_story_token: &target.news_story_token,
      is_successful: false,
      maybe_title_summary: None,
      llm_title_summary_attempts,
      sqlite_pool: &job_state.sqlite_pool,
    }).await?; // NB: If these queries fail, we could get stuck in retry hell.
  }

  update_news_story_llm_title_summary_status(Args {
    news_story_token: &target.news_story_token,
    is_successful: true,
    maybe_title_summary: Some(title_summary.to_string()),
    llm_title_summary_attempts,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?; // NB: If these queries fail, we could get stuck in retry hell.

  Ok(())
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
