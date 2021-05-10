#![allow(dead_code)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![warn(unused_must_use)]
//#![allow(warnings)]

#[macro_use]
extern crate serde_derive;

mod clients;
mod secrets;
//mod util;

use futures::TryStreamExt;
use egg_mode::stream::StreamMessage;
use crate::secrets::Secrets;
use crate::clients::redis_client::RedisClient;
use log::{info, warn, debug};
use crate::clients::twitter_client::TwitterClient;

pub type AnyhowResult<T> = anyhow::Result<T>;

const ENV_PUBLISH_TOPIC : &'static str = "PUBLISH_TOPIC";
const ENV_PUBLISH_TOPIC_DEFAULT : &'static str = "firehose";

const ENV_REDIS_MAX_RETRY_COUNT : &'static str = "REDIS_MAX_RETRY_COUNT";
const ENV_REDIS_MAX_RETRY_COUNT_DEFAULT : u32 = 3;

/// Monitor Twitter for interesting events against our account.
/// With this implementation, we can capture: Mentions, Retweets, Replies.
/// We cannot capture: Follows.
#[tokio::main]
async fn main() -> anyhow::Result<()>
{
  easyenv::init_env_logger(None);

  let redis_publish_topic = easyenv::get_env_string_or_default(
    ENV_PUBLISH_TOPIC, ENV_PUBLISH_TOPIC_DEFAULT);

  let redis_max_retry_count = easyenv::get_env_num(
    ENV_REDIS_MAX_RETRY_COUNT,
    ENV_REDIS_MAX_RETRY_COUNT_DEFAULT)?;

  let secrets = Secrets::from_file("secrets.toml")?;

  let mut redis_client = RedisClient::new(
    &secrets.redis,
    redis_max_retry_count
  );

  redis_client.connect().await?;

  info!("Verifying Twitter access token...");
  let twitter_access_token = secrets.twitter.verify_access_token().await?;

  info!("Streaming...");

  /*

  Here's an @vocodes mention by @vocodesbot:
  ==========================================

  Tweet: Tweet { coordinates: None, created_at: 2021-05-09T19:00:01Z, current_user_retweet: None,
  display_text_range: None, entities: TweetEntities { hashtags: [], symbols: [], urls: [],

  user_mentions: [MentionEntity { id: 1297106371238932481, range: (17, 25), name: "vocodes", screen_name: "vocodes" }],

  media: None }, extended_entities: None, favorite_count: 0, favorited: Some(false), filter_level: Some(Low),
  id: 1391468014755880962, in_reply_to_user_id: None, in_reply_to_screen_name: None, in_reply_to_status_id: None,
  lang: Some("en"), place: None, possibly_sensitive: None, quoted_status_id: None, quoted_status: None,
  retweet_count: 0, retweeted: Some(false), retweeted_status: None,
  source: Some(TweetSource { name: "Twitter Web App", url: "https://mobile.twitter.com" }),
  text: "Okay, so I think @vocodes mentions should work", truncated: false,
  user: Some(TwitterUser { contributors_enabled: false, created_at: 2020-09-27T02:04:35Z, default_profile: true,
  default_profile_image: false, description: Some("This is a bot account for @vocodes /
    https://t.co/EDUojadeKa, created by @echelon. You can make it quote you by mentioning it. Please don\'t use this for evil. DEEP FAKE."),
  entities: UserEntities { description: UserEntityDetail { urls: [] }, url: None }, favourites_count: 2, follow_request_sent: None,
  followers_count: 30, friends_count: 1, geo_enabled: true, id: 1310037441441599488, is_translator: false,
  lang: None, listed_count: 1, location: Some("Atlanta, GA"), name: "vocodes bot", profile_background_color: "F5F8FA",
  profile_background_image_url: Some(""), profile_background_image_url_https: Some(""), profile_background_tile: Some(false),
  profile_banner_url: None, profile_image_url: "http://pbs.twimg.com/profile_images/1310044084506112000/vVJwVAcf_normal.png",
  profile_image_url_https: "https://pbs.twimg.com/profile_images/1310044084506112000/vVJwVAcf_normal.png", profile_link_color: "1DA1F2",
  profile_sidebar_border_color: "C0DEED", profile_sidebar_fill_color: "DDEEF6", profile_text_color: "333333",
  profile_use_background_image: true, protected: false, screen_name: "VocodesBot", show_all_inline_media: None, status: None,
  statuses_count: 64, time_zone: None, url: Some("https://vo.codes"), utc_offset: None, verified: false,
  withheld_in_countries: Some([]), withheld_scope: None }), withheld_copyright: false, withheld_in_countries: None, withheld_scope: None }


  Here's an @vocodes retweet (not quote tweet) by @vocodesbot
  ============================================================

  Tweet: Tweet { coordinates: None, created_at: 2021-05-09T19:12:44Z, current_user_retweet: None, display_text_range: None,
  entities: TweetEntities { hashtags: [], symbols: [], urls: [],

  user_mentions: [MentionEntity { id: 1297106371238932481, range: (3, 11), name: "vocodes", screen_name: "vocodes" }],

  media: None }, extended_entities: None, favorite_count: 0, favorited: Some(false), filter_level: Some(Low), id: 1391471213713805315,
  in_reply_to_user_id: None, in_reply_to_screen_name: None, in_reply_to_status_id: None, lang: Some("en"), place: None,
  possibly_sensitive: None, quoted_status_id: None, quoted_status: None, retweet_count: 0, retweeted: Some(false),

  retweeted_status: Some(Tweet { coordinates: None, created_at: 2021-04-25T02:49:40Z, current_user_retweet: None, display_text_range: Some((0, 140)),
  entities: TweetEntities { hashtags: [], symbols: [], urls: [UrlEntity { display_url: "twitter.com/i/web/status/1…",

  expanded_url: Some("https://twitter.com/i/web/status/1386150388873715712"), range: (117, 140),
  url: "https://t.co/x5JPIBKr3x" }], user_mentions: [], media: None }, extended_entities: None,
  favorite_count: 17, favorited: Some(false), filter_level: Some(Low), id: 1386150388873715712,
  in_reply_to_user_id: None, in_reply_to_screen_name: None, in_reply_to_status_id: None, lang: Some("en"),
  place: None, possibly_sensitive: Some(false), quoted_status_id: None, quoted_status: None, retweet_count: 11,
  retweeted: Some(false), retweeted_status: None, source: Some(TweetSource { name: "Twitter Web App",
  url: "https://mobile.twitter.com" }),
  text: "You\'ll also get Joker (and JFK) in tomorrow\'s stream. I haven\'t scheduled it yet, but I\'m
  thinking 2 or 3 PM EDT. I\'ll post in a bit. https://t.co/T97CR9BXcf",
  truncated: true, user: Some(TwitterUser { contributors_enabled: false, created_at: 2020-08-22T09:41:05Z,
  default_profile: true, default_profile_image: false, description: Some("It looks like a toy now, but
  I want to democratize Hollywood with tech. \ntext to speech: https://t.co/htL5ArOIPW\ninteractive
  twitch stream: https://t.co/qMvlOF5Zji\nMade by @echelon"), entities: UserEntities { description:
  UserEntityDetail { urls: [] }, url: None }, favourites_count: 602, follow_request_sent: None,
  followers_count: 2264, friends_count: 129, geo_enabled: false, id: 1297106371238932481, is_translator: false,
  lang: None, listed_count: 7, location: Some("Atlanta, GA"), name: "vocodes", profile_background_color: "F5F8FA",
  profile_background_image_url: Some(""), profile_background_image_url_https: Some(""),
  profile_background_tile: Some(false), profile_banner_url: Some("https://pbs.twimg.com/profile_banners/1297106371238932481/1599623560"),
  profile_image_url: "http://pbs.twimg.com/profile_images/1305039188023222273/NmVznkUO_normal.png",
  profile_image_url_https: "https://pbs.twimg.com/profile_images/1305039188023222273/NmVznkUO_normal.png",
  profile_link_color: "1DA1F2", profile_sidebar_border_color: "C0DEED", profile_sidebar_fill_color: "DDEEF6",
  profile_text_color: "333333", profile_use_background_image: true, protected: false, screen_name: "vocodes",
  show_all_inline_media: None, status: None, statuses_count: 303, time_zone: None, url: Some("https://vo.codes"),
  utc_offset: None, verified: false, withheld_in_countries: Some([]), withheld_scope: None }),
  withheld_copyright: false, withheld_in_countries: None, withheld_scope: None }),
  source: Some(TweetSource { name: "Twitter Web App", url: "https://mobile.twitter.com" }),
  text: "RT @vocodes: You\'ll also get Joker (and JFK) in tomorrow\'s stream. I haven\'t scheduled it yet, but
  I\'m thinking 2 or 3 PM EDT. I\'ll post in…", truncated: false, user: Some(TwitterUser { contributors_enabled: false,
  created_at: 2020-09-27T02:04:35Z, default_profile: true, default_profile_image: false, description: Some("This is a bot
  account for @vocodes / https://t.co/EDUojadeKa, created by @echelon. You can make it quote you by mentioning it.
  Please don\'t use this for evil. DEEP FAKE."), entities: UserEntities { description:
  UserEntityDetail { urls: [] }, url: None }, favourites_count: 2, follow_request_sent: None, followers_count: 30,
  friends_count: 1, geo_enabled: true, id: 1310037441441599488, is_translator: false, lang: None, listed_count: 1,
  location: Some("Atlanta, GA"), name: "vocodes bot", profile_background_color: "F5F8FA", profile_background_image_url: Some(""),
  profile_background_image_url_https: Some(""), profile_background_tile: Some(false), profile_banner_url: None,
  profile_image_url: "http://pbs.twimg.com/profile_images/1310044084506112000/vVJwVAcf_normal.png",
  profile_image_url_https: "https://pbs.twimg.com/profile_images/1310044084506112000/vVJwVAcf_normal.png",
  profile_link_color: "1DA1F2", profile_sidebar_border_color: "C0DEED", profile_sidebar_fill_color: "DDEEF6",
  profile_text_color: "333333", profile_use_background_image: true, protected: false, screen_name: "VocodesBot",
  show_all_inline_media: None, status: None, statuses_count: 65, time_zone: None, url: Some("https://vo.codes"), utc_offset: None,
  verified: false, withheld_in_countries: Some([]), withheld_scope: None }), withheld_copyright: false, withheld_in_countries: None,
  withheld_scope: None }


   */

  /*
  let stream = egg_mode::stream::filter()
    .follow(&[1297106371238932481]) // vocodes
    .track(&["vocodes"])
    //.language(&["en"])
    .start(&twitter_access_token)
    .try_for_each(|m| {
      if let StreamMessage::Tweet(tweet) = m {
        info!("Tweet: {:?}", &tweet);
      } else {
        info!("Other: {:?}", &m);
      }
      futures::future::ok(())
    });

  if let Err(e) = stream.await {
    warn!("Disconnected. Stream error: {:?}", e);
  }

  Ok(())*/

  let twitter_client = TwitterClient::new(twitter_access_token);

  twitter_client.main_loop().await;
  Ok(())
}