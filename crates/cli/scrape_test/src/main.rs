use clap::{App, Arg};
use errors::{anyhow, AnyhowResult};
use web_scrapers::scrape_supported_webpage::scrape_supported_webpage;

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  let matches = App::new("scrape_test")
      .arg(Arg::with_name("url")
          .short("u")
          .long("url")
          .value_name("URL")
          .help("URL of the page to scrape")
          .takes_value(true)
          .required(true))
      .arg(Arg::with_name("print_html")
          .long("html")
          .help("Print the HTML scraped")
          .takes_value(false)
          .required(false))
      .get_matches();

  let url = matches.value_of("url")
      .map(|val| val.trim().to_string())
      .ok_or(anyhow!("no url supplied"))?;

  let print_html = matches.is_present("print_html");

  let scrape_result = scrape_supported_webpage(&url).await?;

  if print_html {
    println!("{}", scrape_result.original_html)
  } else {
    println!("{:#?}", scrape_result.result)
  }

  Ok(())
}
