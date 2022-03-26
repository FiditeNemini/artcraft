use twitch_oauth2::tokens::UserTokenBuilder;
use twitch_oauth2::{Scope, ClientSecret, ClientId, CsrfToken};
use twitch_oauth2::url::Url;

/// Get the token builder with the scopes our app needs
/// This is used in several places, so centralize creation here.
pub fn get_oauth_token_builder(
  client_id: &str,
  client_secret: &str,
  redirect_url: &Url,
  force_verify: bool
) -> UserTokenBuilder {

  let client_id = ClientId::new(client_id);
  let client_secret = ClientSecret::new(client_secret);

  /*
    - AnalyticsReadExtensions,  scope: "analytics:read:extensions",  doc: "View analytics data for the Twitch Extensions owned by the authenticated account.";
    - AnalyticsReadGames,       scope: "analytics:read:games",       doc: "View analytics data for the games owned by the authenticated account.";
    [YES] BitsRead,                 scope: "bits:read",                  doc: "View Bits information for a channel.";
    - ChannelEditCommercial,    scope: "channel:edit:commercial",    doc: "Run commercials on a channel.";
    - ChannelManageBroadcast,   scope: "channel:manage:broadcast",   doc: "Manage a channel’s broadcast configuration, including updating channel configuration and managing stream markers and stream tags.";
    - ChannelManageExtensions,  scope: "channel:manage:extensions",  doc: "Manage a channel’s Extension configuration, including activating Extensions.";
    (?) ChannelManagePolls,       scope: "channel:manage:polls",       doc: "Manage a channel’s polls.";
    (?) ChannelManagePredictions, scope: "channel:manage:predictions", doc: "Manage of channel’s Channel Points Predictions";
    - ChannelManageRedemptions, scope: "channel:manage:redemptions", doc: "Manage Channel Points custom rewards and their redemptions on a channel.";
    - ChannelManageSchedule,    scope: "channel:manage:schedule",    doc: "Manage a channel’s stream schedule.";
    - ChannelManageVideos,      scope: "channel:manage:videos",      doc: "Manage a channel’s videos, including deleting videos.";
    - ChannelModerate,          scope: "channel:moderate",           doc: "Perform moderation actions in a channel. The user requesting the scope must be a moderator in the channel.";
    - ChannelReadEditors,       scope: "channel:read:editors",       doc: "View a list of users with the editor role for a channel.";
    - ChannelReadGoals,         scope: "channel:read:goals",         doc: "View Creator Goals for a channel.";
    - ChannelReadHypeTrain,     scope: "channel:read:hype_train",    doc: "View Hype Train information for a channel.";
    (?) ChannelReadPolls,         scope: "channel:read:polls",         doc: "View a channel’s polls.";
    (?) ChannelReadPredictions,   scope: "channel:read:predictions",   doc: "View a channel’s Channel Points Predictions.";
    + ChannelReadRedemptions,   scope: "channel:read:redemptions",   doc: "View Channel Points custom rewards and their redemptions on a channel.";
    - ChannelReadStreamKey,     scope: "channel:read:stream_key",    doc: "View an authorized user’s stream key.";
    + ChannelReadSubscriptions, scope: "channel:read:subscriptions", doc: "View a list of all subscribers to a channel and check if a user is subscribed to a channel.";
    - ChannelSubscriptions,     scope: "channel_subscriptions",      doc: "\\[DEPRECATED\\] Read all subscribers to your channel.";
    [YES] ChatEdit,                 scope: "chat:edit",                  doc: "Send live stream chat and rooms messages.";
    [YES] ChatRead,                 scope: "chat:read",                  doc: "View live stream chat and rooms messages.";
    (?) ClipsEdit,                scope: "clips:edit",                 doc: "Manage Clips for a channel.";
    (?) ModerationRead,           scope: "moderation:read",            doc: "View a channel’s moderation data including Moderators, Bans, Timeouts, and Automod settings.";
    (?) ModeratorManageAutoMod,   scope: "moderator:manage:automod",   doc: "Manage messages held for review by AutoMod in channels where you are a moderator.";
    - UserEdit,                 scope: "user:edit",                  doc: "Manage a user object.";
    - UserEditBroadcast,        scope: "user:edit:broadcast",        doc: "Edit your channel's broadcast configuration, including extension configuration. (This scope implies user:read:broadcast capability.)";
    - UserEditFollows,          scope: "user:edit:follows",          doc: "Edit a user’s follows.";
    - UserManageBlockedUsers,   scope: "user:manage:blocked_users",  doc: "Manage the block list of a user.";
    - UserReadBlockedUsers,     scope: "user:read:blocked_users",    doc: "View the block list of a user.";
    - UserReadBroadcast,        scope: "user:read:broadcast",        doc: "View a user’s broadcasting configuration, including Extension configurations.";
    - UserReadEmail,            scope: "user:read:email",            doc: "Read an authorized user’s email address.";
    - UserReadFollows,          scope: "user:read:follows",          doc: "View the list of channels a user follows.";
    (?) UserReadSubscriptions,    scope: "user:read:subscriptions",    doc: "View if an authorized user is subscribed to specific channels.";
    - WhispersEdit,             scope: "whispers:edit",              doc: "Send whisper messages.";
    - WhispersRead,             scope: "whispers:read",              doc: "View your whisper messages.";
   */

  UserTokenBuilder::new(client_id, client_secret, redirect_url.clone())
      .set_scopes(vec![
        Scope::BitsRead, // Using bits to cheer (cost money, larger streams)
        Scope::ChannelReadRedemptions, // Channel points redeemed (free points, smaller streams)
        Scope::ChannelReadSubscriptions, // List subscribing (paying) users
        Scope::ChatEdit, // IRC send
        Scope::ChatRead, // IRC read
      ])
      .force_verify(force_verify)
}
