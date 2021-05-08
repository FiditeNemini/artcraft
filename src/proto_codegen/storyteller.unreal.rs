/// The payloads delivered to unreal engine over the pubsub bus.
/// These are the "enriched" events.
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct UnrealEventPayloadV1 {
    /// Source of the event.
    #[prost(enumeration="unreal_event_payload_v1::SourceType", tag="1")]
    pub source_type: i32,
    /// Type of the payload.
    #[prost(enumeration="unreal_event_payload_v1::PayloadType", tag="2")]
    pub payload_type: i32,
    /// A binary-encoded proto whose type is based on SourceType
    #[prost(bytes="vec", tag="3")]
    pub source_data: ::prost::alloc::vec::Vec<u8>,
    /// A binary-encoded proto whose type is based on PayloadType
    #[prost(bytes="vec", tag="4")]
    pub payload_data: ::prost::alloc::vec::Vec<u8>,
    /// An optional debug message.
    #[prost(string, tag="5")]
    pub debug_message: ::prost::alloc::string::String,
}
/// Nested message and enum types in `UnrealEventPayloadV1`.
pub mod unreal_event_payload_v1 {
    /// If people Retweet us or mention us, we should show that in the engine!
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum SourceType {
        StDoNotUse = 0,
        StAdminPanel = 1,
        StVocodesWebsite = 2,
        StTwitch = 3,
        StTwitter = 4,
        StDiscord = 5,
        StYoutube = 6,
        StReddit = 7,
        StTiktok = 8,
    }
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum PayloadType {
        PtDoNotUse = 0,
        /// Game events. These can come from many sources (control panel, Twitch, Discord)
        VocodesTts = 1,
        LevelWarp = 2,
        CesiumWarp = 3,
        CesiumTimeChange = 4,
        ///CHANGE_MUSIC = 6;
        SpawnCreature = 5,
        /// Twitter-specific events.
        TwitterFollow = 200,
        TwitterRetweet = 201,
        TwitterMention = 202,
        /// Discord-specific events.
        DiscordJoined = 300,
        /// YouTube-specific events.
        YoutubeSubscribed = 400,
    }
}
// ============================== SOURCE PROTOS ============================== //

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct TwitchMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(int64, tag="1")]
    pub user_id: i64,
    #[prost(string, tag="2")]
    pub username: ::prost::alloc::string::String,
    #[prost(bool, tag="3")]
    pub user_is_mod: bool,
    #[prost(bool, tag="4")]
    pub user_is_subscribed: bool,
    /// Optional. Name of the channel, prefixed with hash. eg. `#vocodes`.
    #[prost(string, tag="5")]
    pub channel: ::prost::alloc::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct TwitterMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, tag="1")]
    pub username: ::prost::alloc::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct DiscordMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, tag="1")]
    pub username: ::prost::alloc::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct YoutubeMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, tag="1")]
    pub username: ::prost::alloc::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct RedditMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, tag="1")]
    pub username: ::prost::alloc::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct TikTokMetadata {
    /// Optional. Fields describing the user that sent the message.
    #[prost(string, tag="1")]
    pub username: ::prost::alloc::string::String,
}
// ============================== GAME EVENT PROTOS ============================== //

/// Change time in Cesium.
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct CesiumTimeChangeRequest {
    /// Required
    #[prost(int64, tag="1")]
    pub hour: i64,
}
/// Warp within a Cesium geospatial world.
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct CesiumWarpRequest {
    /// Required
    #[prost(double, tag="1")]
    pub latitude: f64,
    /// Required
    #[prost(double, tag="2")]
    pub longitude: f64,
    /// TODO: Remove these.
    /// Optional. Fields describing the user that sent the message.
    #[prost(int64, tag="3")]
    pub twitch_user_id: i64,
    #[prost(string, tag="4")]
    pub twitch_username: ::prost::alloc::string::String,
    #[prost(bool, tag="5")]
    pub twitch_user_is_mod: bool,
    #[prost(bool, tag="6")]
    pub twitch_user_is_subscribed: bool,
    /// TODO: Remove these.
    /// Optional. Name of the channel, prefixed with hash. eg. `#vocodes`.
    #[prost(string, tag="7")]
    pub twitch_channel: ::prost::alloc::string::String,
}
/// Change the level
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LevelWarpRequest {
    /// Required. Level to warp to.
    #[prost(string, tag="1")]
    pub level_slug: ::prost::alloc::string::String,
}
/// Spawn a creature
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct SpawnCreatureRequest {
    /// Required. Name of the creature.
    #[prost(int64, tag="1")]
    pub name_slug: i64,
}
/// Do text to speech
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct VocodesTtsRequest {
    /// Required. Speaker to use.
    #[prost(string, tag="1")]
    pub voice_slug: ::prost::alloc::string::String,
    /// Required. Text to speak.
    #[prost(double, tag="2")]
    pub text: f64,
}
// ============================== TWITTER EVENT PROTOS ============================== //

/// Intentionally blank
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct TwitterFollow {
}
/// Intentionally blank
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct TwitterRetweet {
}
/// Intentionally blank
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct TwitterMention {
}
// ============================== DISCORD EVENT PROTOS ============================== //

/// Intentionally blank
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct DiscordJoined {
}
// ============================== YOUTUBE EVENT PROTOS ============================== //

/// Intentionally blank
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct YoutubeSubscribed {
}
