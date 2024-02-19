use crate::http_server::endpoints::image_gen::enqueue_image_generation::{EnqueueImageGenRequest, EnqueueImageGenRequestError};
use crate::http_server::endpoints::image_gen::replacement_prompts::get_replacement_prompt;
use crate::util::classify_prompt::classify_prompt;

pub struct EnrichedPrompts {
  pub positive_prompt: String,
  pub maybe_negative_prompt: Option<String>,
}

/// Enrich the user-provided prompts.
/// In the future, we can add prompt engineering to these.
pub fn enrich_prompt(request: &EnqueueImageGenRequest) -> Option<EnrichedPrompts> {
  let mut positive_prompt = match request.maybe_prompt.as_deref() {
    None => return None, // NB: Some callers aren't running prompts.
    Some(prompt) => prompt.to_string(),
  };

  let mut maybe_negative_prompt = request.maybe_n_prompt.clone();

  let classification = classify_prompt(&positive_prompt);

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
