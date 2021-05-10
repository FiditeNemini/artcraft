use crate::AnyhowResult;
use log::{info, debug, warn};
use futures::TryStreamExt;
use egg_mode::stream::StreamMessage;
use std::time::Duration;
use std::thread;
use egg_mode::tweet::Tweet;

const VOCODES_USER_ID : u64 = 1297106371238932481;

pub struct TwitterClient {
  access_token: egg_mode::Token,
}

impl TwitterClient {

  pub fn new(access_token: egg_mode::Token) -> Self {
    Self {
      access_token,
    }
  }

  pub async fn main_loop(&self) {
    loop {
      info!("Connecting to twitter stream...");
      if let Err(e) = self.run_stream().await {
        warn!("Disconnected from stream; error = {:?}", e);
      }
      info!("Disconnected; reconnecting after timeout...");
      thread::sleep(Duration::from_secs(30));
    }
  }

  pub async fn run_stream(&self) -> AnyhowResult<()> {
    let stream = egg_mode::stream::filter()
      .follow(&[VOCODES_USER_ID]) // vocodes
      .track(&["vocodes"])
      .start(&self.access_token)
      .try_for_each(|m| {
        if let StreamMessage::Tweet(tweet) = m {
          self.handle_tweet(tweet);
        } else {
          info!("Other (non-Tweet) message: {:?}", &m);
        }
        futures::future::ok(())
      });

    Ok(stream.await?)
  }

  fn handle_tweet(&self, tweet: Tweet) -> AnyhowResult<()> {
    info!("Tweet: {:?}", &tweet);

    let mut user_id : Option<u64> = None;
    let mut username : Option<String> = None;
    let mut display_name : Option<String> = None;
    let mut profile_image_url : Option<String> = None;

    if let Some(user) = tweet.user {
      if user.id == VOCODES_USER_ID {
        warn!("Tweet is by @vocodes account; skipping");
        return Ok(());
      }

      user_id = Some(user.id);
      username = Some(user.screen_name.clone());
      display_name = Some(user.name.clone());
      profile_image_url = Some(user.profile_image_url.clone());
    }

    let mut has_mention = false;

    for mention in tweet.entities.user_mentions.iter() {
      if mention.id == VOCODES_USER_ID {
        has_mention = true;
      }
    }

    let mut is_retweet = false;
    let mut retweeted_text : Option<String> = None;

    if let Some(retweet) = tweet.retweeted_status {
      if let Some(original_author) = retweet.user {
        if original_author.id == VOCODES_USER_ID {
          is_retweet = true;
          retweeted_text = Some(retweet.text.clone());
        }
      }
    }

    let tweet_text = tweet.text.clone();

    let tweet_details = TweetDetails {
      has_mention,
      is_retweet,
      retweeted_text,
      user_id,
      username,
      display_name,
      profile_image_url,
      tweet_text,
    };

    info!("\n\nTweet Details: {:?}", tweet_details);

    Ok(())
  }
}

#[derive(Clone, Debug)]
pub struct TweetDetails {
  tweet_text: String,

  has_mention: bool,
  is_retweet: bool,
  retweeted_text: Option<String>,

  user_id : Option<u64>,
  username : Option<String>,
  display_name : Option<String>,
  profile_image_url : Option<String>,
}
