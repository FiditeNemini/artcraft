use classify_text::classify_prompt::classify_prompt;

use crate::http_server::endpoints::image_gen::enqueue_image_generation::EnqueueImageGenRequest;
use crate::http_server::endpoints::image_gen::replacement_prompts::get_replacement_prompt;

pub struct EnrichedPrompts {
  pub positive_prompt: String,
  pub maybe_negative_prompt: Option<String>,
}

const DEFAULT_NEGATIVE_PROMPT : &str = "nudity, nsfw, naked, sex";

/// Enrich the user-provided prompts.
/// In the future, we can add prompt engineering to these.
pub fn enrich_prompt(request: &EnqueueImageGenRequest) -> Option<EnrichedPrompts> {
  let mut positive_prompt = match request.maybe_prompt.as_deref() {
    None => return None, // NB: Some callers aren't running prompts.
    Some(prompt) => prompt.to_string(),
  };

  let mut maybe_negative_prompt = request.maybe_n_prompt
      .as_ref()
      .map(|prompt| prompt.to_string());

  let classification = classify_prompt(&positive_prompt);

  if !classification.prompt_references_sex {
    // If the prompt doesn't have sex terms in it, try to make sure it doesn't get generated.
    match maybe_negative_prompt.as_deref() {
      None => {
        maybe_negative_prompt = Some(DEFAULT_NEGATIVE_PROMPT.to_string());
      }
      Some(negative_prompt) => {
        let new_negative_prompt = format!("{}, {}", negative_prompt, DEFAULT_NEGATIVE_PROMPT);
        maybe_negative_prompt = Some(new_negative_prompt);
      }
    }
  }

  if classification.is_abusive() {
    // NB: Save the original prompt as the negative prompt so that we can study it.
    maybe_negative_prompt = Some(positive_prompt.clone());
    positive_prompt = get_replacement_prompt().to_string();
  }

  Some(EnrichedPrompts {
    positive_prompt,
    maybe_negative_prompt,
  })
}
