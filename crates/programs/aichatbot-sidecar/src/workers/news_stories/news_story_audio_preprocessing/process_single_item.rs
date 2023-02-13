use std::sync::Arc;
use once_cell::sync::Lazy;
use regex::Regex;
use errors::AnyhowResult;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_audio_preprocessing_status::update_news_story_audio_preprocessing_status;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_audio_preprocessing_status::Args as UpdateArgs;
use sqlite_queries::queries::by_table::tts_render_targets::insert_tts_render_target::Args as InsertArgs;
use sqlite_queries::queries::by_table::tts_render_targets::insert_tts_render_target::insert_tts_render_target;
use tokens::tokens::tts_models::TtsModelToken;
use crate::persistence::rendition_data::RenditionData;
use crate::persistence::speakable_monologue::SpeakableMonologue;
use crate::shared_state::job_state::JobState;

static NEWLINE_REGEX : Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"[\r\n]+").expect("regex should parse")
});

static SPACE_REGEX : Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"[\s]+").expect("regex should parse")
});

// Regex at current version doesn't support look-around. UGH.
//static SPACE_REGEX : Lazy<Regex> = Lazy::new(|| {
//  Regex::new(r"(?<=.{150,}[\.?])").expect("regex should parse")
//});

pub async fn process_single_item(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {
  let rendition_data = {
    let yaml_filename = job_state.save_directory
        .rendition_file_for_webpage_url(&target.original_news_canonical_url)?;
    RenditionData::try_from_yaml_file(yaml_filename)?
  };

  let text = rendition_data.response.trim();

  let paragraphs = split_into_manageable_portions(&text);

  let speakable_monologue = SpeakableMonologue {
    paragraphs: paragraphs.clone(),
  };

  {
    let yaml_filename = job_state.save_directory
        .speakable_monologue_file_for_webpage_url(&target.original_news_canonical_url)?;
    speakable_monologue.write_to_yaml_file(yaml_filename)?;
  }

  // NB: John Madden voice model
  let tts_model_token = TtsModelToken::new_from_str("TM:30ha2t6bxfn4");

  for paragraph in paragraphs {
    insert_tts_render_target(InsertArgs {
      news_story_token: &target.news_story_token,
      tts_voice_identifier: &tts_model_token,
      full_text: &paragraph,
      sqlite_pool: &job_state.sqlite_pool,
    }).await?;
  }

  update_news_story_audio_preprocessing_status(UpdateArgs {
    news_story_token: &target.news_story_token,
    is_success: true,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?;

  Ok(())
}

fn split_into_manageable_portions(text: &str) -> Vec<String> {
  let trimmed_text = text.trim();

  let mut speakable_portions = Vec::new();

  for paragraph in NEWLINE_REGEX.split(trimmed_text) {
    let trimmed_paragraph = paragraph.trim();
    if trimmed_paragraph.is_empty() {
      continue;
    }

    if trimmed_paragraph.len() > 250 {
      speakable_portions.extend(split_paragraph(&trimmed_paragraph));
    } else {
      speakable_portions.push(paragraph.to_string());
    }
  }

  speakable_portions
}

fn split_paragraph(text: &str) -> Vec<String> {
  let trimmed_text = text.trim();

  let mut speakable_portions = Vec::new();

  // TODO: Use a binary search like algorithm instead. Or better, understand the underlying NLP task.
  let mut word_buffer = Vec::new();
  let mut word_counter = 0;
  let mut character_counter = 0;
  let mut should_cut = false;

  for wordlike in SPACE_REGEX.split(trimmed_text) {
    let wordlike_trimmed = wordlike.trim();

    word_counter += 1;
    character_counter += wordlike_trimmed.len();

    word_buffer.push(wordlike_trimmed.to_string());

    if word_counter > 70 || character_counter > 400 {
      should_cut = true;
    }

    if should_cut && (
      wordlike_trimmed.ends_with(".")
      || wordlike_trimmed.ends_with("?")
      || wordlike_trimmed.ends_with("\"")
      || wordlike_trimmed.ends_with("!")) {

      speakable_portions.push(word_buffer.join(" "));
      word_buffer.clear();

      word_counter = 0;
      character_counter = 0;
      should_cut = false;
    }
  }

  if word_buffer.len() > 0 {
    speakable_portions.push(word_buffer.join(" "));
  }

  speakable_portions
}

#[cfg(test)]
mod tests {
  use crate::workers::news_stories::news_story_audio_preprocessing::process_single_item::split_into_manageable_portions;

  #[test]
  fn test_split_long_text() {
    let text = concat!(
      r#"Arkansas Governor Sarah Huckabee Sanders gave a vehement speech Tuesday night in response to President Joe Biden's State of the Union address, "#,
      r#"critically comparing herself to the President. Sanders, who is forty years old, connected her age to Biden's, who is eighty, saying that this shows "#,
      r#"a divide between the two in generations. She portrayed Biden as unfit to be commander-in-chief and described the current political condition as a "#,
      r#"struggle between "normal and crazy". Prior to her line of criticism, Sanders gave a nod to newly established Republican control of the House and said "#,
      r#"that Speaker Kevin McCarthy and Senate Republican Leader Mitch McConnell would hold the Biden administration to its word. Serving as White House press "#,
      r#"secretary under President Donald Trump, Sanders talked about her memories of a Christmas trip the two took together to Iraq, how the troops cheered upon "#,
      r#"their entrance, and the Unity of Americans in the service of their country. On education policy, Sarah Huckabee Sanders spoke about the need for "#,
      r#"instruction and not indoctrination for students of all backgrounds, referring to an executive order she passed last year. In statements released ahead of "#,
      r#"the address, McConnell and McCarthy both commended the Youngest Governor in the nation for her leadership skills. The response to the State of the Union "#,
      r#"was provided by Palin Huckabee Sanders."#
    );

    // TODO: This test isn't very well thought out. We should make better assertions and have more tests.
    let results = split_into_manageable_portions(&text);

    assert_eq!(results.len(), 3); // Total paragraph count

    for paragraph  in results.iter() {
      assert!(results.len() < 450);
    }
  }
}
