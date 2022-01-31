use once_cell::sync::Lazy;
use std::collections::HashSet;

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
