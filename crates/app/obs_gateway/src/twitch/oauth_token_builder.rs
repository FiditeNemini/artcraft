use twitch_oauth2::tokens::UserTokenBuilder;
use twitch_oauth2::{Scope, ClientSecret, ClientId};
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

  UserTokenBuilder::new(client_id, client_secret, redirect_url.clone())
      .set_scopes(vec![
        Scope::BitsRead,
        Scope::ChannelReadSubscriptions,
        Scope::ChatEdit,
        Scope::ChatRead,
      ])
      .force_verify(force_verify)
}