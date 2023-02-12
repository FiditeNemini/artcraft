
// TODO: We'll add more types of prompt templates in the future.

pub struct NewsArticlePrompt {
  // TODO: Add other details (title, etc.)
  paragraphs: Vec<String>,
}

impl NewsArticlePrompt {

  pub fn new(paragraphs: &Vec<String>) -> Self {
    Self {
      paragraphs: paragraphs.clone(),
    }
  }

  // TODO: This will need a lot of work and experimentation.
  pub fn make_prompt(&self) -> String {
    let start = "The following is a news article:\n\n";

    let end = "\n\nPlease reword the above article as if you were a newscaster presenting the news. Spell out any abbreviations and numbers";

    format!("{}{}{}", start, &self.paragraphs.join("\n\n"), end)
  }
}
