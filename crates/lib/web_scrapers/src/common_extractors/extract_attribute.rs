use scraper::{Html, Selector};

pub fn extract_attribute(document: &Html, element_selector: &Selector, attribute_name: &str) -> Option<String> {
  let element = match document.select(element_selector).next() {
    None => {
      println!("NOT FOUND");
      return None
    },
    Some(element) => element,
  };

  println!("FOUND");

  element.value()
      .attr(attribute_name)
      .map(|value| value.to_string())
}

//#[cfg(test)]
//mod tests {
//  use crate::common_extractors::extract_text::extract_text;
//  use crate::sites::cnn::cnn_article_scraper::CNN_TITLE_SELECTOR;
//  use crate::sites::techcrunch::techcrunch_article_scraper::TECHCRUNCH_TITLE_SELECTOR;
//  use scraper::{Html, Selector};
//
//  #[test]
//  fn test_extract_text_cnn() {
//    let html = include_str!("../../../../../test_data/html_scraping/cnn_article_with_video.html");
//    let document = Html::parse_document(&html);
//
//    let maybe_text = extract_text(&document, &CNN_TITLE_SELECTOR);
//
//    assert_eq!(Some("Ford Mustang Mach-E has a mile of wires it doesn’t need. That’s a big deal"),
//               maybe_text.as_deref());
//  }
//
//  #[test]
//  fn test_extract_text_techcrunch() {
//    let html = include_str!("../../../../../test_data/html_scraping/techcrunch_article.html");
//    let document = Html::parse_document(&html);
//
//    let maybe_text = extract_text(&document, &TECHCRUNCH_TITLE_SELECTOR);
//
//    assert_eq!(Some("‘Nothing, Forever,’ an AI ‘Seinfeld’ spoof, is the next ‘Twitch Plays Pokémon’"),
//               maybe_text.as_deref());
//  }
//}
