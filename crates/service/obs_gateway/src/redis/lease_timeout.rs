use time::Duration;

/// Our Twitch PubSub subscriber threads must renew leases in
/// order to be granted an exclusive "lock" on a single user.
/// If the underlying Redis key goes away, another thread can
/// begin leasing.
pub const LEASE_TIMEOUT_SECONDS : usize = 60;
