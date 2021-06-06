use pulldown_cmark::{Options, Parser, html};

pub fn markdown_to_html(markdown_input: &str) -> String {
  let mut options = Options::empty();
  options.insert(Options::ENABLE_STRIKETHROUGH);

  let parser = Parser::new_ext(markdown_input, options);

  // TODO(bt): Is this buffer size sufficient? Just based on benchmarks? Will this panic?
  let mut html_output: String = String::with_capacity(markdown_input.len() * 3 / 2);
  html::push_html(&mut html_output, parser);

  html_output
}