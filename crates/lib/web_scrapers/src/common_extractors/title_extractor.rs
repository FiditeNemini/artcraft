use scraper::{Html, Selector};

pub fn extract_title(document: &Html, title_selector: &Selector) -> Option<String> {
  let title_element = match document.select(title_selector).next() {
    None => return None,
    Some(title_element) => title_element,
  };

  let mut pieces = Vec::new();

  for mut text in title_element.text() {
    text = text.trim();
    if !text.is_empty() {
      pieces.push(text.to_string());
    }
  }

  Some(pieces.join(" ").trim().to_string())
}

#[cfg(test)]
mod tests {
  use scraper::{Html, Selector};
  use crate::common_extractors::title_extractor::extract_title;

  #[test]
  fn text_extract_title_cnn() {
    let html = include_str!("../../../../../test_data/html_scraping/cnn_article.html");
    let document = Html::parse_document(&html);

    let selector = Selector::parse(".headline__text").expect("selector should parse");
    let maybe_title = extract_title(&document, &selector);

    assert_eq!(Some("Ford Mustang Mach-E has a mile of wires it doesn’t need. That’s a big deal"),
               maybe_title.as_deref());
  }

  #[test]
  fn text_extract_title_techcrunch() {
    let html = include_str!("../../../../../test_data/html_scraping/techcrunch_article.html");
    let document = Html::parse_document(&html);

    let selector = Selector::parse(".article__title").expect("selector should parse");
    let maybe_title = extract_title(&document, &selector);

    assert_eq!(Some("‘Nothing, Forever,’ an AI ‘Seinfeld’ spoof, is the next ‘Twitch Plays Pokémon’"),
               maybe_title.as_deref());
  }
}
