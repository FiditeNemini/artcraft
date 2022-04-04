/// Ingestion platforms are "dumb" and shouldn't have much logic in them.
/// (Granted, we might eventually grow to send them back messages.)
///
/// The "enricher" is the smarts. It does denylisting, rate limiting, 
/// service calls, transforms, etc.
///
/// What if we need to scale? Several ideas: Sharding (redis db indices), 
/// brokers with read-once semantics (our own intelligence - UUIDs with 
/// transactional semantics in MySQL).
///
/// Events coming from multiple sources
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct PubsubEventPayloadV1 {
    /// Source of the event.
    #[prost(enumeration="pubsub_event_payload_v1::IngestionSourceType", optional, tag="1")]
    pub ingestion_source_type: ::core::option::Option<i32>,
    #[prost(enumeration="pubsub_event_payload_v1::IngestionPayloadType", optional, tag="2")]
    pub ingestion_payload_type: ::core::option::Option<i32>,
    /// A binary-encoded proto whose type is based on IngestionSourceType
    #[prost(bytes="vec", optional, tag="3")]
    pub ingestion_source_data: ::core::option::Option<::prost::alloc::vec::Vec<u8>>,
    /// A binary-encoded proto whose type is based on IngestionPayloadType
    #[prost(bytes="vec", optional, tag="4")]
    pub ingestion_payload_data: ::core::option::Option<::prost::alloc::vec::Vec<u8>>,
    /// An optional debug message.
    #[prost(string, optional, tag="5")]
    pub debug_message: ::core::option::Option<::prost::alloc::string::String>,
}
/// Nested message and enum types in `PubsubEventPayloadV1`.
pub mod pubsub_event_payload_v1 {
    /// TODO: This should all be merged in the future, but I need to settle on proto2 vs proto3
    /// And I also need to figure out package names, etc.
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum IngestionSourceType {
        IstDoNotUse = 0,
        IstAdminPanel = 1,
        IstVocodesWebsite = 2,
        IstTwitch = 3,
        IstTwitter = 4,
        IstDiscord = 5,
        IstYoutube = 6,
        IstReddit = 7,
        IstTiktok = 8,
    }
    /// These will differ from the "enriched" types.
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum IngestionPayloadType {
        IptDoNotUse = 0,
        /// Twitch-specific events.
        ///
        /// This can encode lots of things.
        TwitchMessage = 100,
        TwitchSubscribed = 101,
        /// Twitter-specific events.
        TwitterFollow = 200,
        TwitterRetweet = 201,
        TwitterMention = 202,
        /// Discord-specific events.
        DiscordMessage = 300,
        DiscordJoined = 301,
        /// YouTube-specific events.
        YoutubeSubscribed = 400,
        /// Reddit-specific events.
        RedditMessage = 500,
    }
}
// ============================== SOURCE PROTOS ============================== //

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionTwitchMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(int64, optional, tag="1")]
    pub user_id: ::core::option::Option<i64>,
    #[prost(string, optional, tag="2")]
    pub username: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(bool, optional, tag="3")]
    pub user_is_mod: ::core::option::Option<bool>,
    #[prost(bool, optional, tag="4")]
    pub user_is_subscribed: ::core::option::Option<bool>,
    /// Optional. Name of the channel, prefixed with hash. eg. `#vocodes`.
    #[prost(string, optional, tag="5")]
    pub channel: ::core::option::Option<::prost::alloc::string::String>,
}
/// Optional. Fields describing the user that sent the message.
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionTwitterMetadata {
    // TODO: This is a u64. We need to be careful with math to assure non-overflow.
    //optional int64 user_id = 1;

    #[prost(string, optional, tag="2")]
    pub username: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag="3")]
    pub display_name: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag="4")]
    pub avatar_url: ::core::option::Option<::prost::alloc::string::String>,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionDiscordMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, optional, tag="1")]
    pub username: ::core::option::Option<::prost::alloc::string::String>,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionYoutubeMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, optional, tag="1")]
    pub username: ::core::option::Option<::prost::alloc::string::String>,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionRedditMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, optional, tag="1")]
    pub username: ::core::option::Option<::prost::alloc::string::String>,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionTikTokMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, optional, tag="1")]
    pub username: ::core::option::Option<::prost::alloc::string::String>,
}
// ============================== TWITCH PAYLOAD PROTOS ============================== //

/// These are raw messages from Twitch that we send to the PubSub enricher.
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionTwitchMessage {
    /// TODO: DEPRECATE THESE
    #[prost(int64, optional, tag="1")]
    pub user_id: ::core::option::Option<i64>,
    #[prost(string, optional, tag="2")]
    pub username: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(bool, optional, tag="3")]
    pub is_mod: ::core::option::Option<bool>,
    #[prost(bool, optional, tag="4")]
    pub is_subscribed: ::core::option::Option<bool>,
    /// TODO: DEPRECATE THESE
    /// Name of the channel, prefixed with hash. eg. `#vocodes`.
    #[prost(string, optional, tag="5")]
    pub channel: ::core::option::Option<::prost::alloc::string::String>,
    /// Actual message. Doesn't need to be trimmed.
    #[prost(string, optional, tag="6")]
    pub message_contents: ::core::option::Option<::prost::alloc::string::String>,
}
/// Intentionally blank for now
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionTwitchSubscribed {
}
// ============================== TWITTER PAYLOAD PROTOS ============================== //

/// Intentionally blank for now
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionTwitterFollow {
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionTwitterRetweet {
    /// Intentionally blank for now
    #[prost(string, optional, tag="1")]
    pub original_text: ::core::option::Option<::prost::alloc::string::String>,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionTwitterMention {
    /// Intentionally blank for now
    #[prost(string, optional, tag="1")]
    pub text: ::core::option::Option<::prost::alloc::string::String>,
}
// ============================== DISCORD PAYLOAD PROTOS ============================== //

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionDiscordMessage {
    /// Raw message. Needs to be trimmed
    #[prost(string, optional, tag="6")]
    pub message_contents: ::core::option::Option<::prost::alloc::string::String>,
}
/// Intentionally blank for now
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionDiscordJoined {
}
// ============================== YOUTUBE PAYLOAD PROTOS ============================== //

/// Intentionally blank for now
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionYoutubeSubscribed {
}
// ============================== REDDIT PAYLOAD PROTOS ============================== //

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct IngestionRedditMessage {
    /// Raw message. Needs to be trimmed
    #[prost(string, optional, tag="6")]
    pub message_contents: ::core::option::Option<::prost::alloc::string::String>,
}
