use enums::common::sqlite::awaitable_job_status::AwaitableJobStatus;
use enums::common::sqlite::web_content_type::WebContentType;
use tokens::tokens::news_stories::NewsStoryToken;

pub struct NewsStoryProductionItem {
  pub id: i64,
  pub news_story_token: NewsStoryToken,
  pub web_content_type: WebContentType,
  pub original_news_canonical_url: String,
  pub original_news_title: String,

  // Overall production status, which depends on all other statuses
  pub overall_production_status: AwaitableJobStatus,

  // LLM rendition task
  pub llm_rendition_status: AwaitableJobStatus,
  pub llm_rendition_attempts: i64,

  // Audio generation tasks (farmed out to 1:n work items)
  pub audio_generation_status: AwaitableJobStatus,

  // Image generation task
  pub image_generation_status: AwaitableJobStatus,
  pub image_generation_attempts: i64,
}
