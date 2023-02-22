
pub struct CategorizationGptPrompt {
  // TODO: Add other details (title, etc.)
  paragraphs: Vec<String>,
}

impl CategorizationGptPrompt {

  pub fn new(paragraphs: &Vec<String>) -> Self {
    Self {
      paragraphs: paragraphs.clone(),
    }
  }

  pub fn make_prompt(&self) -> String {
    // TODO: This will need a lot of work and experimentation.
    let start = "Come up with a comma separated list of keywords or concepts for this news article:\n\n-----\n\n";

    let end = "\n\n-----\n\nThese keywords will classify the key points of the article. List the top five words and no more";

    format!("{}{}{}", start, &self.paragraphs.join("\n\n"), end)
  }
}
