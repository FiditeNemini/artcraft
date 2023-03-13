//!
//! This is for testing new functionality quickly without running the whole program.
//!

use sqlx::sqlite::SqlitePoolOptions;
use async_openai::Client;
use async_openai::types::{CreateImageRequest, ImageSize, ResponseFormat};
use enums::common::sqlite::web_content_type::WebContentType;
use errors::AnyhowResult;
use crate::persistence::save_directory::SaveDirectory;
use crate::startup_args::get_startup_args;
use crate::workers::web::web_content_scraping::single_target::ingest_url_scrape_and_save::ingest_url_scrape_and_save;

pub async fn test() -> AnyhowResult<()> {
  let database_url = easyenv::get_env_string_required("DATABASE_URL")?;
  let pool = SqlitePoolOptions::new()
      .max_connections(5)
      .connect(&database_url).await?;

  let _ = dotenv::from_filename(".env-aichatbot-secrets").ok();
  let startup_args = get_startup_args()?;
  let save_directory = SaveDirectory::new(&startup_args.save_directory);

  //let url = "https://techcrunch.com/2023/02/04/elon-musk-says-twitter-will-provide-a-free-write-only-api-to-bots-providing-good-content/";
  let url = "https://www.cnn.com/2023/02/04/business/automakers-problems-catching-up-with-tesla/index.html";
  ingest_url_scrape_and_save(url, WebContentType::CnnArticle, &save_directory).await?;

  let openai_client = Client::new()
      .with_api_key(startup_args.openai_secret_key.clone());

  let create_request = CreateImageRequest {
    n: Some(1),
    //prompt: "A news headline image; headline: After nearly one year of war, how Ukraine defied the odds — and may still defeat Russia".to_string(),
    //prompt: "A news headline image; headline: 'Heartbreaking': Visitor accidentally shatters Jeff Koons 'balloon dog' sculpture at Art Wynwood".to_string(),
    //prompt: "A news headline image; headline: Mayorkas goes on the offensive as GOP scrutiny builds, says it’s up to Congress to fix immigration system ".to_string(),
    //prompt: "Brave or lucky? See the moment a dog took on a hammerhead shark".to_string(),
    //prompt: "Headline: Jimmy Carter to begin receiving home hospice care".to_string(),
    //prompt: "Nine children hurt, shooting; Tragic, frightful, chaotic, violent, frightening.".to_string(),
    //prompt: "9 kids hurt in Georgia; Disturbing, tragic, frightening, violent, chaotic; Art Style/Director: Wes Anderson/Surrealist.; remove text; no text; no English text".to_string(),
    //prompt: "Summary: 9 kids hurt in Georgia; Adjectives: Disturbing, tragic, frightening, violent, chaotic; Art Style/Director: Wes Anderson/Surrealist.".to_string(),
    //prompt: "Reviving cheetahs in India. Adventurous, ambitious, necessary, daring, wild. Wes Anderson, Runnings fields with cheetahs racing around in the distance, trees swaying in the wind, and the sun setting in the background.".to_string(),
    prompt: "Closure found after WWII; moving, emotional, joyous, triumphant, proud.
Art style: Impressionism.
Setting: A coastal beach with a few people looking out to sea, with a large American flag waving in the background. Objects: a few boats in the distant, a lighthouse, and some driftwood on the shore. A photo or painting of this might be a peaceful beachscape with vibrant colors of the sky, sea, and flag.".to_string(),
    //prompt: "LGBTQ love, vibrant, colorful, playful, revolutionary. Art style: Bollywood musicals. Setting: A city street in the evening, lit up with vibrant neon signs and bustling crowds. There are couples in traditional Indian clothing, dancing and singing around colorful street vendors selling snacks and trinkets.".to_string(),
    //prompt: "Kinkade painting of Releasing twelve manatees: miraculous, astounding, incredible, remarkable, amazing. Setting: A peaceful beach, with gentle sand and a clear blue sky. Objects: A crowd of people lined up along the shore, a boat full of manatees, and the vibrant colors of the ocean.".to_string(),
    //prompt: "Photo of Releasing twelve manatees: miraculous, astounding, incredible, remarkable, amazing. Art style: Tim Burton.".to_string(),
    size: Some(ImageSize::S1024x1024),
    response_format: Some(ResponseFormat::Url),
    user: Some("test".to_string()),
  };

  let response = openai_client
      .images()
      .create(create_request)
      .await
      .unwrap();

//  let create_edit_request = CreateImageEditRequest {
//    image: ImageInput { path: PathBuf::from("runtime_data/scaled_test.png") },
//    mask: ImageInput { path: PathBuf::from("runtime_data/scaled_mask.png") },
//    prompt: "Closure found after WWII; moving, emotional, joyous, triumphant, proud.
//Art style: Impressionism.
//Setting: A coastal beach with a few people looking out to sea, with a large American flag waving in the background. Objects: a few boats in the distant, a lighthouse, and some driftwood on the shore. A photo or painting of this might be a peaceful beachscape with vibrant colors of the sky, sea, and flag.".to_string(),
//    n: Some(1),
//    size: Some(ImageSize::S1024x1024),
//    response_format: Some(ResponseFormat::Url),
//    user: Some("test".to_string()),
//  };
//
//  let response = openai_client
//      .images()
//      .create_edit(create_edit_request)
//      .await
//      .unwrap();


  println!("Response: {:?}", response);

  Ok(())
}

