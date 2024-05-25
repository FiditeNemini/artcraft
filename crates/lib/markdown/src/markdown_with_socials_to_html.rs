use pulldown_cmark::{html, Options, Parser};
use regex::{Captures, Regex};

// TODO(bt,2024-05-25): In the future, we may want a builder class with features
//  that can be turned on/off as well as comprehensive tests and sane defaults.

pub fn markdown_with_socials_to_html(markdown_input: &str) -> String {
  // NB: CommonMark allows for HTML, including <script>! WTF!
  // Let's prevent that nonsense.
  // https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
  let markdown_input = markdown_input
      .replace("&", "&amp;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
      .replace("\"", "&quot;")
      .replace("'", "&#x27;"); // NB: &apos; is not in the HTML spec

  // TODO: Use copy on write
  let markdown_input = replace_instagram_user(&markdown_input);
  let markdown_input = replace_reddit_subreddit(&markdown_input);
  let markdown_input = replace_reddit_user(&markdown_input);
  let markdown_input = replace_tiktok_user(&markdown_input);
  let markdown_input = replace_x_user(&markdown_input);
  let markdown_input = replace_youtube_channel(&markdown_input);

  let mut options = Options::empty();
  options.insert(Options::ENABLE_STRIKETHROUGH);

  let parser = Parser::new_ext(&markdown_input, options);

  // NB: The buffer size can expand, but the math is a sizing heuristic I found in one of the
  // examples that may prevent buffer resizing.
  let mut html_output: String = String::with_capacity(markdown_input.len() * 3 / 2);
  html::push_html(&mut html_output, parser);

  html_output
}

// TODO(bt,2024-05-25): Not sure if the username parsing is right for each service.

fn replace_instagram_user(input: &str) -> String {
  let re = Regex::new(r"(insta(gram)?(.com)?/([\w\-_]+))").unwrap(); // TODO: once_cell
  let result = re.replace(input, |caps: &Captures| {
    format!("[{}](https://instagram.com/{})", &caps[1], &caps[4])
  });
  result.to_string()
}

fn replace_reddit_subreddit(input: &str) -> String {
  let re = Regex::new(r"(r/([\w\-_]+))").unwrap(); // TODO: once_cell
  let result = re.replace(input, |caps: &Captures| {
    format!("[{}](https://www.reddit.com/r/{})", &caps[1], &caps[2])
  });
  result.to_string()
}

fn replace_reddit_user(input: &str) -> String {
  let re = Regex::new(r"(u/([\w\-_]+))").unwrap(); // TODO: once_cell
  let result = re.replace(input, |caps: &Captures| {
    format!("[{}](https://www.reddit.com/user/{})", &caps[1], &caps[2])
  });
  result.to_string()
}

fn replace_tiktok_user(input: &str) -> String {
  let re = Regex::new(r"(tiktok(.com)?/([@\w\-_]+))").unwrap(); // TODO: once_cell
  let result = re.replace(input, |caps: &Captures| {
    format!("[{}](https://www.tiktok.com/{})", &caps[1], &caps[3])
  });
  result.to_string()
}

fn replace_x_user(input: &str) -> String {
  let re = Regex::new(r"(x(.com)?/([\w\-_]+))").unwrap(); // TODO: once_cell
  let result = re.replace(input, |caps: &Captures| {
    format!("[{}](https://x.com/{})", &caps[1], &caps[3])
  });
  result.to_string()
}

fn replace_youtube_channel(input: &str) -> String {
  let re = Regex::new(r"((yt|youtube(.com)?)/([@\w\-_]+))").unwrap(); // TODO: once_cell
  let result = re.replace(input, |caps: &Captures| {
    format!("[{}](https://www.youtube.com/{})", &caps[1], &caps[4])
  });
  result.to_string()
}

#[cfg(test)]
mod tests {
  use crate::markdown_with_socials_to_html::markdown_with_socials_to_html;

  mod basics {
    use super::*;
    
    #[test]
    fn handles_markdown() {
      assert_eq!(&markdown_with_socials_to_html("*italics text*"),
                 "<p><em>italics text</em></p>\n");

      assert_eq!(&markdown_with_socials_to_html("**bold text**"),
                 "<p><strong>bold text</strong></p>\n");
    }

    #[test]
    fn do_not_allow_html_entities() {
      assert_eq!(&markdown_with_socials_to_html("this > that"),
                 "<p>this &gt; that</p>\n");

      assert_eq!(&markdown_with_socials_to_html("&"),
                 "<p>&amp;</p>\n");

      // NB: We doubly entity decode because pulldown_cmark doesn't do enough!
      assert_eq!(&markdown_with_socials_to_html("&gt;"),
                 "<p>&amp;gt;</p>\n");
    }

    #[test]
    fn do_not_allow_html_tags() {
      assert_eq!(&markdown_with_socials_to_html("<script>alert();</script>"),
                 "<p>&lt;script&gt;alert();&lt;/script&gt;</p>\n");
    }
  }

  mod instagram {
    use super::*;

    #[test]
    pub fn insta() {
      assert_eq!(&markdown_with_socials_to_html("insta/storyteller_ai"),
                 "<p><a href=\"https://instagram.com/storyteller_ai\">insta/storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn instagram() {
      assert_eq!(&markdown_with_socials_to_html("instagram/storyteller_ai"),
                 "<p><a href=\"https://instagram.com/storyteller_ai\">instagram/storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn instagram_dot_com() {
      assert_eq!(&markdown_with_socials_to_html("instagram.com/storyteller_ai"),
                 "<p><a href=\"https://instagram.com/storyteller_ai\">instagram.com/storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn insta_before_after() {
      assert_eq!(&markdown_with_socials_to_html("creator insta/storyteller_ai posted it"),
                 "<p>creator <a href=\"https://instagram.com/storyteller_ai\">insta/storyteller_ai</a> posted it</p>\n");
    }
  }

  mod reddit {
    use super::*;

    #[test]
    pub fn reddit_subreddit() {
      assert_eq!(&markdown_with_socials_to_html("r/storyteller"),
                 "<p><a href=\"https://www.reddit.com/r/storyteller\">r/storyteller</a></p>\n");
    }

    #[test]
    pub fn reddit_user() {
      assert_eq!(&markdown_with_socials_to_html("u/storyteller_ai"),
                 "<p><a href=\"https://www.reddit.com/user/storyteller_ai\">u/storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn reddit_user_before_after() {
      assert_eq!(&markdown_with_socials_to_html("creator u/storyteller_ai posted it"),
                 "<p>creator <a href=\"https://www.reddit.com/user/storyteller_ai\">u/storyteller_ai</a> posted it</p>\n");
    }
  }

  mod tiktok {
    use super::*;

    #[test]
    pub fn tiktok() {
      assert_eq!(&markdown_with_socials_to_html("tiktok/storyteller_ai"),
                 "<p><a href=\"https://www.tiktok.com/storyteller_ai\">tiktok/storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn tiktok_dot_com() {
      assert_eq!(&markdown_with_socials_to_html("tiktok.com/storyteller_ai"),
                 "<p><a href=\"https://www.tiktok.com/storyteller_ai\">tiktok.com/storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn tiktok_before_after() {
      assert_eq!(&markdown_with_socials_to_html("creator tiktok/storyteller_ai posted it"),
                 "<p>creator <a href=\"https://www.tiktok.com/storyteller_ai\">tiktok/storyteller_ai</a> posted it</p>\n");
    }
  }

  mod x {
    use super::*;

    #[test]
    pub fn x() {
      assert_eq!(&markdown_with_socials_to_html("x/storyteller_ai"),
                 "<p><a href=\"https://x.com/storyteller_ai\">x/storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn x_dot_com() {
      assert_eq!(&markdown_with_socials_to_html("x.com/storyteller_ai"),
                 "<p><a href=\"https://x.com/storyteller_ai\">x.com/storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn x_before_after() {
      assert_eq!(&markdown_with_socials_to_html("creator x/storyteller_ai posted it"),
                 "<p>creator <a href=\"https://x.com/storyteller_ai\">x/storyteller_ai</a> posted it</p>\n");
    }
  }

  mod youtube {
    use super::*;

    #[test]
    pub fn youtube() {
      assert_eq!(&markdown_with_socials_to_html("youtube/@storyteller_ai"),
                 "<p><a href=\"https://www.youtube.com/@storyteller_ai\">youtube/@storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn youtube_dot_com() {
      assert_eq!(&markdown_with_socials_to_html("youtube.com/@storyteller_ai"),
                 "<p><a href=\"https://www.youtube.com/@storyteller_ai\">youtube.com/@storyteller_ai</a></p>\n");
    }

    #[test]
    pub fn youtube_before_after() {
      assert_eq!(&markdown_with_socials_to_html("creator youtube/@storyteller_ai posted it"),
                 "<p>creator <a href=\"https://www.youtube.com/@storyteller_ai\">youtube/@storyteller_ai</a> posted it</p>\n");
    }
  }
}
