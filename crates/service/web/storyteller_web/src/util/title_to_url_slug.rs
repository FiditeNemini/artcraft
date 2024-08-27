use once_cell::sync::Lazy;
use regex::Regex;

const PARENS_AND_BRACKETS_REGEX: Lazy<Regex> = Lazy::new(|| {
  Regex::new(concat!(
    r"[\(\[]", // Start delimiter: ( or [
    r"[^\\()\\[\\]]*", // In-between content
    r"[\)\]]" // End delimiter: ) or ]
  )).unwrap()
});

const INVALID_CHARACTER_REGEX: Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"\s+").unwrap()
});
const SPACE_AND_DASH_COLLAPSE_REGEX: Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"[\s\-]+").unwrap()
});

const ENDING_NOISE_REGEX: Lazy<Regex> = Lazy::new(|| {
  // Any non-word characters at the end of the string
  Regex::new(r"[^\w]+$").unwrap()
});

const VERSION_REGEX: Lazy<Regex> = Lazy::new(|| {
  // Examples:
  // Versión 2.
  // Version 1.0
  // v2
  Regex::new(r"(?i)(v)(er(si[oó]n)?)?\s*\d+\.?\d*").unwrap()
});

const UNSAFE_CONTROL_CODE_REGEX: Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"[\u0000-\u001F\u007F-\u009F]").unwrap()
});


/// Convert a model title to a URL slug.
pub fn title_to_url_slug(title: &str) -> Option<String> {
  let title = title.trim().to_lowercase();
  let title = PARENS_AND_BRACKETS_REGEX.replace_all(&title, "");
  let title = VERSION_REGEX.replace_all(title.trim(), "");

  // Dangerous and otherwise bad characters
  // https://perishablepress.com/stop-using-unsafe-characters-in-urls/
  // { , } , | , \ , ^ , ~ , [ , ] , and `
  // Unsafe characters " < > % { } | \ ^ `
  // Reserved Characters : / ? # [ ] @ ! $ & ' ( ) * + , ; =
  let title = title.replace(&[
    '!',
    '#',
    '%',
    '&',
    '(',
    ')',
    '+',
    ',',
    '.',
    '/',
    ':',
    ';',
    '<',
    '=',
    '>',
    '?',
    '@',
    '[',
    '\"',
    '\'',
    ']',
    '^',
    '`',
    '{',
    '|',
    '}',
    '~',
  ][..], " ");

  let title = UNSAFE_CONTROL_CODE_REGEX.replace_all(title.trim(), "");
  let title = SPACE_AND_DASH_COLLAPSE_REGEX.replace_all(title.trim(), "-");
  let title = ENDING_NOISE_REGEX.replace_all(title.trim(), "");

  if title.is_empty() {
    return None;
  } else {
    Some(title.to_string())
  }
}

#[cfg(test)]
mod tests {
  use filesys::read_lines_iterator::read_lines_iterator;
  use testing::test_file_path::test_file_path;

  use crate::util::title_to_url_slug::title_to_url_slug;

  fn assert_expected(expected: &str, title: &str) {
    assert_eq!(title_to_url_slug(title).as_deref(), Some(expected));
  }

  fn assert_none(title: &str) {
    assert_eq!(title_to_url_slug(title).as_deref(), None);
  }

  //#[test]
  fn many_files() {
    let path = test_file_path("model_weights_titles.txt").unwrap();
    let lines = read_lines_iterator(&path).unwrap();
    let mut i = 0;
    for line in lines.flatten() {
      if i > 1000 {
        //break;
      }
      let title = line.as_str();
      let slug = title_to_url_slug(title);

      match slug {
        None => println!("Failed to parse: {}", title),
        Some(slug) => println!("{:?}    <- {:?}", slug, title),
      }

      i += 1;
    }
    assert_eq!(1, 2);
  }

  #[test]
  fn empty_titles() {
    assert_none("   ");
    assert_none("");
    assert_none("...");
  }

  #[test]
  fn simple_titles() {
    assert_expected("bill-nye", "Bill Nye");
  }

  #[test]
  fn parens() {
    assert_expected("foo", "Foo (Bar)");
  }

  #[test]
  fn square_brackets() {
    assert_expected("foo", "Foo [Bar]");
  }

  #[test]
  pub fn dangerous_url_characters() {
    assert_none(r"  // { , } , | , \ , ^ , ~ , [ , ] , `");
    assert_none(r" \ < > % { } | \ ^ `");
    assert_none(r" / ? # [ ] @ ! $ & ' ( ) * + , ; = \ ");
    assert_none("\u{0000}");
    assert_none("\u{001F}");
    assert_expected("at-t-natural-voices-rosa", "AT&T natural voices rosa");
    assert_expected("jaden-judai-yuki", "Jaden/Judai Yuki (JPN, V2)");
  }

  #[test]
  pub fn remove_url_titles() {
    // This is an actual title:
    assert_expected("https-huggingface-co-jkhgf-slwooly-resolve-main-elizabethafton-zip", "https://huggingface.co/jkhgf/SLWooly/resolve/main/ElizabethAfton.zip");
  }

  #[test]
  fn removes_parens() {
    assert_expected("donald-trump", "Donald Trump (Angry)" );
    assert_expected("lionel-messi", "Lionel Messi. (Español 2020 - 2023.)");
    assert_expected("mariano-closs", "Mariano Closs (Relator de fútbol Argentino)");
    assert_expected("mariano-closs","Mariano Closs (full version)");
    assert_expected("naruto-uzumaki", "Naruto Uzumaki (Part 1)");
    assert_expected("waldemaro-martínez", "Waldemaro Martínez. (Locutor de DJ, Latin American Spanish.)");
  }

  #[test]
  fn removes_version_strings() {
    assert_expected("cristiano-ronaldo", "Cristiano Ronaldo. (Español) Versión 2.");
    assert_expected("dragonball-z-narrador", "Dragonball Z Narrador (Latin, Version 1.0)");
    assert_expected("dragonball-z-narrador", "Dragonball Z Narrador Version 1.0");
    assert_expected("peter-griffin", "Peter Griffin (Classic, Version 2.0)");
    assert_expected("peter-griffin", "Peter Griffin Version 2.0");
  }

  #[test]
  fn removes_spaces() {
    assert_expected("foo", "  \t Foo \n  ");
    assert_expected("goku", "Goku (Jose Antonio Gavira) (Castillian Spanish)");
  }

  #[test]
  fn remove_duplicate_dashes() {
    // Normally these would generate multiple dashes (---) but we collapse them to one
    assert_expected("tails-sonic-boom", "Tails - Sonic Boom");
    assert_expected("drums-type-beat-by-regalhyperus", "Drums (from We Are Number One) - Type Beat by regalhyperus");
  }

  #[test]
  fn removes_periods() {
    assert_expected("vegeta", "Vegeta. (IMITADORES.) (Dragon Ball, Latin American Spanish.)");
  }

  #[test]
  fn complex_titles() {
    assert_expected("anime-female-voice-jpn-01", "Anime Female Voice JPN 01");
    assert_expected("at-t-natural-voices-rosa", "AT&T natural voices rosa");
    assert_expected("batman", "Batman[Arkham Knight]");
    assert_expected("ed", "Ed (Plants Vs Zombies Plush) (Luigifan00001)");
    assert_expected("greg-page", "Greg Page (The Wiggles) [by: MasterRuby & wigglyfan2001]");
    assert_expected("jaden-judai-yuki", "Jaden/Judai Yuki (JPN, V2)");
    assert_expected("jeff-fatt", "Jeff Fatt (The Wiggles) [by: MasterRuby & wigglyfan2001]");
    assert_expected("king-charles-iii", "King Charles III");
    assert_expected("millie-vivian-nixon", "Millie [Helluva Boss] \"Vivian Nixon\"");
    assert_expected("murray-cook", "Murray Cook (The Wiggles) [by: MasterRuby & wigglyfan2001]");
    assert_expected("pilou", "Pilou [D_1600] [Del]");
    assert_expected("shaquille-o-neal", "Shaquille O'Neal");
    assert_expected("tobey-maguire", "Tobey Maguire [Spider_Man]");
    assert_expected("vocal-planet-old-man-blues", "Vocal planet, old man blues");
    assert_expected("roxanne-wolf", "Roxanne Wolf (Five Nights at Freddy's: Security Breach, Marta Svetek)");
    assert_expected("hollyhock-manheim-mannheim-guerrero-robinson-zilberschlag-hsung-fonzerelli-mcquack", "Hollyhock Manheim-Mannheim-Guerrero-Robinson-Zilberschlag-Hsung-Fonzerelli-McQuack");

  }

  //#[test]
  //pub fn commas_long() {
  //  assert_expected("", "La voce del calcolatore 1978, delete the duplicate entry");
  //  assert_expected("", "Don Evaristo corral, Version de Ernesto Alban");
  //  assert_expected("", "Roland scat jaz vocals full version, use only for singing scat");
  //}

  #[test]
  pub fn commas_short() {
    assert_expected("dj-street-fighter-6-japan", "dj, street fighter 6 japan");
  }

  #[test]
  pub fn slash() {
    assert_expected("jaden-judai-yuki", "Jaden/Judai Yuki (JPN, V2)");
    assert_expected("jesse-johan-andersen", "Jesse/Johan Andersen (JPN, credit to RX-7Better)");
    //assert_expected("", "고세구 (노래) / gosegu (singing)");
  }

  #[test]
  pub fn partial_parens() {
    assert_expected("spider-man-ps4", "Spider man (PS4");
    assert_expected("black-cat-ps4", "Black Cat [PS4");
  }

  #[test]
  pub fn international_titles() {
    assert_expected("charlie-voz-expresiva-de-narración", "Charlie. Voz expresiva de narración. (11Labs, Castillian Spanish.)");
    assert_expected("doraemon-versión-en-español", "Doraemon. (Catalán 2005) VERSIÓN EN ESPAÑOL. (Doraemon, El Gato Cósmico, Castillian Spanish.)");
    assert_expected("gwen-stacy-spider-gwen-español-latino", "Gwen Stacy/Spider Gwen (El Spiderverso) Español Latino");
    assert_expected("locutor-pokémon-stadium-64", "Locutor Pokémon Stadium 64. (Pokémon, Castillian Spanish.)");
    assert_expected("los-pingüinos-me-la-van-a-mascar-español-latino", "Los Pingüinos Me La Van A Mascar (Meme De Internet) Español Latino");
    assert_expected("narrador-películas-antiguas-españolas-1960", "Narrador Películas Antiguas Españolas 1960. (Castillian Spanish.)");
    assert_expected("натурал-альбертович", "Натурал Альбертович");
    //"trained-by-𝒜𝓁𝑒𝓍-𝑀𝑒𝒽𝒾𝒸𝟣01aqua-hoshino-no-remove"    <- "Trained by:𝒜𝓁𝑒𝓍 𝑀𝑒𝒽𝒾𝒸𝟣01Aqua Hoshino (Oshi no Ko) no remove("
    //  assert_expected("", "ماريو-[فندق-ماريو"); // NB: Character printing direction
    //  assert_expected("", "İnek Şaban (Kemal Sunal)");
    //  assert_expected("", "REİS SEDAT PEKER");
    //  assert_expected("", "고세구 (노래) / gosegu (singing)");
    // "camarón-de-la-isla"    <- "Camarón de la Isla. (Dataset de 1 hora y 10 minutos.)"
    // "recep-i\u{307}vedik"    <- "Recep İvedik (Şahan Gökbakar)"
    // "i\u{307}nek-şaban"    <- "İnek Şaban (Kemal Sunal)"
    //"rei\u{307}s-sedat-peker"    <- "REİS SEDAT PEKER"
    //"고세구-gosegu"    <- "고세구 (노래) / gosegu (singing)"
    //"trunks-del-futuro-360-epochs-5k-stepts-entrenado-en-colaboración-por-matius"    <- "Trunks del Futuro. (Español Latino.) \"360 Epochs. 5k Stepts.\"  ENTRENADO EN COLABORACIÓN POR @Matius"
  }
}
