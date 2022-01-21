use time::Duration;

/// Twitch PubSub requires PINGs at regular intervals,
///
///   "To keep the server from closing the connection, clients must send a PING
///    command at least once every 5 minutes. If a client does not receive a PONG
///    message within 10 seconds of issuing a PING command, it should reconnect
///    to the server. See details in Handling Connection Failures."
///
/// We'll keep this intentionally short so we don't elapse.
pub const TWITCH_PING_CADENCE: Duration = Duration::minutes(3);
