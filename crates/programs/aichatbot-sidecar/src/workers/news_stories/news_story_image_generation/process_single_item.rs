use async_openai::Client;
use async_openai::error::OpenAIError;
use async_openai::types::{CreateCompletionRequestArgs, CreateImageRequest, ImageData, ImageSize, ResponseFormat};
use base64::{Engine as _, engine::general_purpose};
use crate::persistence::image_generation_debug_data::ImageGenerationDebugData;
use crate::persistence::load_scraped_result::load_scraped_result;
use crate::persistence::rendition_data::RenditionData;
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::job_state::JobState;
use crate::workers::news_stories::news_story_llm_rendition::gpt_prompts::news_article_prompt::NewsArticlePrompt;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use errors::{anyhow, AnyhowResult};
use log::{debug, error, info, warn};
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_image_generation_status::Args;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_image_generation_status::update_news_story_image_generation_status;
use std::io::Write;
use std::ops::Add;
use std::sync::Arc;
use web_scrapers::payloads::web_scraping_result::ScrapedWebArticle;

pub async fn process_single_item(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  let scraping_result = load_scraped_result(
    &target.original_news_canonical_url,
    &job_state.save_directory).await?;

  let title = scraping_result.maybe_title
      .unwrap_or("kitsune walking in a forest".to_string());

  let dalle_prompt = generate_dalle_prompt_with_gpt(&title, &job_state.openai_client).await?;

  let create_request = CreateImageRequest {
    n: Some(1),
    prompt: dalle_prompt.clone(),
    size: Some(ImageSize::S1024x1024),
    response_format: Some(ResponseFormat::B64Json),
    user: Some("article".to_string()),
  };

  // TODO: Save both prompts for debugging.

  let response = job_state.openai_client
      .images()
      .create(create_request)
      .await?;

  let maybe_image = response.data.get(0)
      .map(|image| image.as_ref());

  match maybe_image {
    Some(ImageData::B64Json(image_data)) => {
      let decoded_bytes = general_purpose::STANDARD.decode(image_data.as_bytes())?;

      let image_filename = job_state.save_directory
          .generated_headline_image_for_webpage_url(&target.original_news_canonical_url)?;

      let mut file = std::fs::File::create(image_filename)?;
      file.write_all(&decoded_bytes)?;
    }
    _ => {},
  }

  let debug_data = ImageGenerationDebugData {
    image_generation_prompt: dalle_prompt.to_string(),
    maybe_preconditioning_prompt: None, // TODO: Plumb this through.
  };

  let yaml_filename = job_state.save_directory
      .image_generation_prompt_debug_file_webpage_url(&target.original_news_canonical_url)?;

  let _r = debug_data.write_to_yaml_file(yaml_filename)?;

  let image_generation_attempts = target.image_generation_attempts + 1;

  update_news_story_image_generation_status(Args {
    news_story_token: &target.news_story_token,
    is_successful: true,
    image_generation_attempts,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?; // NB: If these queries fail, we could get stuck in retry hell.

//  {
//    let yaml_filename = job_state.save_directory
//        .rendition_file_for_webpage_url(&target.original_news_canonical_url)?;
//    rendition_data.write_to_yaml_file(yaml_filename)?;
//  }

  Ok(())
}

async fn generate_dalle_prompt_with_gpt(headline: &str, openai_client: &Arc<Client>) -> AnyhowResult<String> {
  info!("Building OpenAI Request (GPT for Dall-E prompt)...");

  let mut prompt = r#"
  Turn this headline into a five word or less summary, then add five descriptive adjectives,
  then add the most fitting art style or director. Then describe a setting and potential objects
  in this scene. Describe what a photo or painting of this might look like:
  "#.to_string();

  prompt.push_str("\n\n");
  prompt.push_str(headline);

  let request = CreateCompletionRequestArgs::default()
      .model("text-davinci-003")
      .prompt(prompt)
      .max_tokens(2500_u16)
      .build()
      .map_err(|err| {
        error!("Error building request: {:?}", err);
        err
      })?;

  debug!("Making OpenAI Request (GPT for Dall-E prompt)...");

  let response = openai_client
      .completions()
      .create(request)
      .await
      .map_err(|err| {
        error!("OpenAI Error: {:?}", err);
        err
      })?;

  let response_text = response.choices.get(0)
      .map(|option| option.text.clone())
      .unwrap_or(headline.to_string());

  Ok(response_text)
}
