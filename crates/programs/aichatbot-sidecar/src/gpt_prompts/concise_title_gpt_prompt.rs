
pub struct ConciseTitleGptPrompt {
  title: String,
  paragraphs: Vec<String>,
}

impl ConciseTitleGptPrompt {

  pub fn new(title: &str, paragraphs: &Vec<String>) -> Self {
    Self {
      title: title.to_string(),
      paragraphs: paragraphs.clone(),
    }
  }

  pub fn make_prompt(&self) -> String {
    // TODO: This will need a lot of work and experimentation.
    let start = "The following is a news article:\n\n-----\n\n";

    let end = "\n\n-----\n\nSummarize a headline news title for the article that is under 50 characters. The title must be 50 characters or less";

    format!("{}{}\n\n{}{}", start, &self.title, &self.paragraphs.join("\n\n"), end)
  }
}
