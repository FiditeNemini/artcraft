use crate::AnyhowResult;
use anyhow::anyhow;
use egg_mode::stream::StreamMessage;
use egg_mode::tweet::Tweet;
use futures::TryStreamExt;
use log::{info, debug, warn};
use std::thread;
use std::time::Duration;
use crate::clients::redis_client::RedisClient;
use futures::executor::block_on;

const VOCODES_USER_ID : u64 = 1297106371238932481;

/// The client logic
pub struct TwitterClient {
  access_token: egg_mode::Token,
  redis_client: RedisClient,
}

/// The parts of tweets we care about
#[derive(Clone, Debug)]
pub struct TweetDetails {
  pub tweet_text: String,

  pub has_mention: bool,
  pub is_retweet: bool,
  pub retweeted_text: Option<String>,

  pub user_id : Option<u64>,
  pub username : Option<String>,
  pub display_name : Option<String>,
  pub profile_image_url : Option<String>,
}

impl TwitterClient {

  pub fn new(access_token: egg_mode::Token, redis_client: RedisClient) -> Self {
    Self {
      access_token,
      redis_client,
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
        // NB: Odd implementation is due to future type juggling.
        // I should fix this, but I'm too lazy and have more work to do.
        if let StreamMessage::Tweet(tweet) = m {
          self.handle_tweet_mapping_errors(Some(tweet))
        } else {
          info!("Other (non-Tweet) message: {:?}", &m);
          self.handle_tweet_mapping_errors(None)
        }
      });

    match stream.await {
      Ok(_) => Ok(()),
      Err(_) => Err(anyhow!("Stream error")), // NB: loss of error due to shenanigans
    }
  }

  // NB: This is some nonsense to satisfy type requirements.
  // I'm too lazy to figure out why try_for_each demands egg_mode's Error.
  async fn handle_tweet_mapping_errors(&self, tweet: Option<Tweet>)
    -> Result<(), egg_mode::error::Error>
  {
    // NB: This is horrible.
    self.handle_tweet(tweet)
      .await
      .map_err(|e| {
        warn!("Error during stream: {:?}", e);
        egg_mode::error::Error::BadUrl
      })
  }

  async fn handle_tweet(&self, tweet: Option<Tweet>) -> AnyhowResult<()> {
    let tweet = match tweet {
      None => return Ok(()),
      Some(tweet) => tweet,
    };

    debug!("Tweet: {:?}", &tweet);

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

    info!("Tweet Details: {:?}", tweet_details);
    self.publish_tweet(tweet_details).await?;

    Ok(())
  }

  async fn publish_tweet(&self, tweet_details: TweetDetails) -> AnyhowResult<()> {
    Ok(())
  }
}

