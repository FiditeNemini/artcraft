use std::future::Future;

pub async fn time_section<F, Fut, T>(callback: F) -> T
  where F: Fn() -> Fut,
        Fut: Future<Output = T>,
{
  callback().await
}