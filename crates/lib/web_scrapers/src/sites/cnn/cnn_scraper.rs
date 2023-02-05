use rss::Channel;
use errors::AnyhowResult;

const RSS_TOP_STORIES : &'static str = "http://rss.cnn.com/rss/cnn_topstories.rss";

const RSS_WORLD : &'static str = "http://rss.cnn.com/rss/cnn_world.rss";

const RSS_US : &'static str = "http://rss.cnn.com/rss/cnn_us.rss";

const RSS_TECH : &'static str = "http://rss.cnn.com/rss/cnn_tech.rss";

pub async fn cnn_scraper_test() -> AnyhowResult<()> {
  let content = reqwest::get(RSS_TOP_STORIES)
      .await?
      .bytes()
      .await?;

  let channel = Channel::read_from(&content[..])?;

  for item in channel.items {
    println!("\n\nItem: {:?}", item);

    let maybe_image_url = item.extensions.get("media")
        .map(|media| media.get("group"))
        .flatten()
        .map(|group| group.get(0))
        .flatten()
        .map(|extension| extension.children.get("content"))
        .flatten()
        .map(|extensions| extensions.get(0)) // NB: First image is biggest
        .flatten()
        .map(|extension| extension.attrs.get("url"))
        .flatten();

    if let Some(image_url) = maybe_image_url {
      println!("\n-{:?} ", image_url);
    }
  }

  Ok(())
}
