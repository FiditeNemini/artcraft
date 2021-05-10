use anyhow::anyhow;
use crate::AnyhowResult;
use log::{info, warn, debug};
use crate::clients::twitter_client::TweetDetails;

// Include the protos
pub mod protos {
  include!("proto_codegen/storyteller.pubsub.rs");
}

// Binary encode a proto.
pub fn binary_encode_proto(proto: impl prost::Message) -> AnyhowResult<Vec<u8>> {
  let mut buffer : Vec<u8> = Vec::with_capacity(proto.encoded_len());
  let encode_result = proto.encode(&mut buffer);

  match encode_result {
    Err(e) => {
      Err(anyhow!("Inner proto encode result: {:?}", e))
    }
    Ok(_) => {
      Ok(buffer)
    }
  }
}

pub fn mention_to_proto<'a>(tweet_details: TweetDetails) -> AnyhowResult<protos::PubsubEventPayloadV1>
{
  let mut payload_proto = protos::PubsubEventPayloadV1::default();

  payload_proto.ingestion_source_type =
    Some(protos::pubsub_event_payload_v1::IngestionSourceType::IstTwitter as i32);

  let binary_twitter_metadata = {
    let mut twitter_metadata = protos::IngestionTwitterMetadata::default();
    // TODO: Don't want to overflow. Represent as bytes in the meantime
    // twitter_metadata.user_id = Some(tweet_details.user_id as i64);
    twitter_metadata.username = tweet_details.username.clone();
    twitter_metadata.display_name = tweet_details.display_name.clone();
    twitter_metadata.avatar_url = tweet_details.profile_image_url.clone();

    debug!("Twitter Metadata Proto: {:?}", twitter_metadata);

    binary_encode_proto(twitter_metadata)
  }?;

  payload_proto.ingestion_source_data = Some(binary_twitter_metadata);

  payload_proto.ingestion_payload_type =
    Some(protos::pubsub_event_payload_v1::IngestionPayloadType::TwitterMention as i32);

  let binary_twitter_mention = {
    let mut twitter_mention = protos::IngestionTwitterMention::default();
    twitter_mention.text = Some(tweet_details.tweet_text.clone());

    debug!("Twitter Mention Proto: {:?}", twitter_mention);

    binary_encode_proto(twitter_mention)
  }?;

  payload_proto.ingestion_payload_data = Some(binary_twitter_mention);

  Ok(payload_proto)
}
