use crate::redis::lease_payload::LeasePayload;
use crate::redis::lease_timeout::LEASE_TIMEOUT_SECONDS;
use crate::redis::obs_active_payload::ObsActivePayload;
use crate::threads::twitch_pubsub_user_subscriber_thread::twitch_pubsub_user_subscriber_thread;
use log::error;
use log::info;
use log::warn;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use redis_common::redis_keys::RedisKeys;
use sqlx::MySql;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use tokio::runtime::Runtime;

pub async fn listen_for_active_obs_session_thread(
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  redis_pubsub_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  runtime: Arc<Runtime>,
) {
  // TODO: ERROR HANDLING
  let mut pubsub_pool = redis_pubsub_pool.get().unwrap();
  let mut pubsub = pubsub_pool.as_pubsub();
  let channel = RedisKeys::obs_active_session_topic();
  pubsub.subscribe(channel).unwrap();

  let mut count = 0;

  //loop {
  //  let payload : String = try!(msg.get_payload());
  //  println!("channel '{}': {}", msg.get_channel_name(), payload);
  //}

  loop {
    //info!("[PubSub]");

    // TODO: ERROR HANDLING
    let message = pubsub.get_message().unwrap();
    let payload : String = message.get_payload().unwrap();

    //info!("Message: {}", payload);

    let payload = ObsActivePayload::from_json_str(&payload).unwrap();

    //info!("Message decoded: {:?}", payload);

    let lease_key = RedisKeys::twitch_pubsub_lease(&payload.twitch_user_id);

    let mut redis = redis_pool.get().unwrap();

    let lease_value : Option<String> = redis.get(&lease_key).unwrap();

    if let Some(value) = lease_value.as_deref() {
      //info!("Already has lease.");
      let lease = LeasePayload::deserialize(value).unwrap();

      //info!("Lease value: {:?}", &lease);

      continue;
    }

    info!("No existing lease for {:?}...", &lease_key);

    let lease = LeasePayload::new("foo", "bar");

    let serialized = lease.serialize();
    let _v : Option<String> = redis.set_ex(
      &lease_key,
      &serialized,
          LEASE_TIMEOUT_SECONDS
    ).unwrap();

    let twitch_user_id = payload.twitch_user_id.clone();
    let redis_pool2 = redis_pool.clone();
    let mysql_pool2 = mysql_pool.clone();

    runtime.spawn(twitch_pubsub_user_subscriber_thread(twitch_user_id, mysql_pool2, redis_pool2));


    // Publish: (ActiveSession, user_id)
    //  - On: First connect
    //  - Every 30 seconds
    //  - 1,000 users  x  10 servers  =  10,000  = 333 QPS
    //  - 100 users  x  5 servers  =  500  = 16 QPS
    // Redis Benchmarks
    //   SET: 552028.75 requests per second (high spec machine)
    //   GET: 707463.75 requests per second (high spec machine)
    //   SET: 100007 requests completed in 0.88 seconds (no pipeline)
    //   GET: 100000 requests completed in 1.23 seconds (no pipeline)

    // Lease Key w/ 60s TTL: "ActiveSessionLease:{user_id}"
    // Lease Value: "{serverNonce}:{threadNonce}" (to kill same-server dupes)




    // Data structures:
    // - HashSet of user ids (maybe not needed?)
    // - Random threads (don't need to be tracked)
    // - Redis leases that expire every 30 seconds - 1 minute
    //   --- But polling these leases in a big cluster is high QPS

    // > New UserId:
    // If not present in HashSet, try to create a Redis lease
    // If lease already taken, ignore.
    // If lease created, create a new thread.
    // Thread continually renews lease (every 10 seconds)
    // Puts in a threadlocal random nonce into lease. If differs at
    //  any point, we know some other process somehow got a lease. Abort.


    // frontend --> lease key
    //   -- no, frontend won't know about disconnects, just drought of events

/*
    THIS WORKS
    if count < 3 {
      info!("Spawning....");

      let count2 = count;

      runtime.spawn(async move {
        let count3 = count2;
        loop {
          info!(".....spawned..... {}", count3);
          sleep(Duration::from_millis(1_000));
        }
      });
    }

    count += 1;
 */
  }
}
