use once_cell::sync::Lazy;
use std::collections::HashSet;
use regex::Regex;

// NB: This can be used as a nice, succinct macro with once_cell:
//macro_rules! regex {
//    ($re:literal $(,)?) => {{
//        static RE: once_cell::sync::OnceCell<regex::Regex> = once_cell::sync::OnceCell::new();
//        RE.get_or_init(|| regex::Regex::new($re).unwrap())
//    }};
//}

/// Remove cheermotes from text, eg "this is great Cheer1" -> "this is great"
pub fn remove_cheers(text: &str) -> String {
  let result = TWITCH_CHEER_REGEX.replace_all(text, "");
  let result = MULTI_SPACE_REGEX.replace_all(&result, " ").to_string();
  result.trim().to_string()
}

/// These cheer emotes always combine with a number
/// This list seems pretty comprehensive
/// https://github.com/nossebro/TwitchPubSubMirror/blob/master/TwitchPubSubMirror_StreamlabsSystem.py

static TWITCH_CHEERS : Lazy<HashSet<String>> = Lazy::new(|| {
  let cheers = vec![
    "Cheer",
    "DoodleCheer",
    "BibleThump",
    "cheerwhal",
    "Corgo",
    "uni",
    "ShowLove",
    "Party",
    "SeemsGood",
    "Pride",
    "Kappa",
    "FrankerZ",
    "HeyGuys",
    "DansGame",
    "EleGiggle",
    "TriHard",
    "Kreygasm",
    "4Head",
    "SwiftRage",
    "NotLikeThis",
    "FailFish",
    "VoHiYo",
    "PJSalt",
    "MrDestructoid",
    "bday",
    "RIPCheer",
    "Shamrock",
    "BitBoss",
    "Streamlabs",
    "Muxy",
    "HolidayCheer"
  ];
  let mut s = HashSet::new();
  for cheer in cheers.into_iter() {
    s.insert(cheer.to_string());
  }
  s
});

static MULTI_SPACE_REGEX : Lazy<Regex> = Lazy::new(|| {
  Regex::new("(\\s{2,})").unwrap()
});

static TWITCH_CHEER_REGEX : Lazy<Regex> = Lazy::new(|| {
  let mut regex_pieces  = Vec::new();

  for cheer in TWITCH_CHEERS.iter() {
    regex_pieces.push(format!("({}\\d+)", cheer));
  }

  let regex = regex_pieces.join("|");
  let regex = format!("({})", regex);

  Regex::new(&regex).unwrap()
});

#[cfg(test)]
mod tests {
  use crate::cheers::remove_cheers;

  #[test]
  fn test_remove_cheers() {
    let r = remove_cheers("testing Kappa1 SeemsGood100 removal");
    assert_eq!(&r, "testing removal");

    let r = remove_cheers("Kappa1 SeemsGood100 no more Cheer1 cheers");
    assert_eq!(&r, "no more cheers");
  }
}
