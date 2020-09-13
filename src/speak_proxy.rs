use crate::Router;
use crate::api::{ExternalHttpRequest, InternalSpeakRequest, ErrorResponse, ErrorType};
use crate::newrelic_logger::{MaybeNewRelicTransaction};
use hyper::Method;
use hyper::header::HeaderValue;
use hyper::http::header::HeaderName;
use hyper::{Body, Request, Response, HeaderMap};
use std::fmt::Debug;
use std::net::IpAddr;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

pub async fn speak_proxy_with_retry(
  ip_addr: IpAddr,
  request: Request<Body>,
  router: Arc<Router>,
  _transaction: MaybeNewRelicTransaction,
  max_retries: u8,
  retry_wait_ms: u64,
  proxy_hostname: &str,
  endpoint: &'static str) -> Result<Response<Body>, ErrorResponse>
{
  let mut attempt : u8 = 0;

  let external_http_request = ExternalHttpRequest::decode_request(request).await.unwrap();

  // This is the IP of the Digital Ocean load balancer.
  let gateway_ip = HeaderValue::from_str(&ip_addr.to_string())
    .ok()
    .unwrap_or(HeaderValue::from_static(""));

  // This is the IP of the upstream client browser.
  let upstream_client_ip = external_http_request.headers.get(HeaderName::from_static("x-forwarded-for"))
    .map(|ip| ip.to_str().unwrap_or(""))
    .unwrap_or("");

  let upstream_client_ip = HeaderValue::from_str(upstream_client_ip)
    .ok()
    .unwrap_or(HeaderValue::from_static(""));

  let mut headers_to_proxy = external_http_request.headers.clone();

  headers_to_proxy.insert(HeaderName::from_static("forwarded"), upstream_client_ip.clone());
  headers_to_proxy.insert(HeaderName::from_static("x-forwarded-for"), upstream_client_ip.clone());

  // Unfortunately it looks like this middleware trounces the standard headers, so
  // here we put it somewhere it won't be overwritten.
  headers_to_proxy.insert(HeaderName::from_static("x-voder-proxy-for"), upstream_client_ip.clone());
  headers_to_proxy.insert(HeaderName::from_static("x-gateway-ip"), gateway_ip);

  // We're going to be changing the request body length, so remove the reported value
  // so Hyper doesn't choke on any mismatch.
  headers_to_proxy.remove(HeaderName::from_static("content-length"));

  // The proxy host is a Kubernetes load balancer. We're not doing the round robin magic here,
  // so it makes sense to reuse the same value for each retry.
  let load_balancer_hostname = router.get_speaker_host(&external_http_request.speak_request.speaker);

  loop {
    let internal_speak_request = InternalSpeakRequest {
      speaker: external_http_request.speak_request.speaker.clone(),
      text: external_http_request.speak_request.text.clone(),
      retry_attempt_number: attempt,
      skip_rate_limiter: false,
    };

    let result = speak_proxy(
      ip_addr,
      internal_speak_request,
      headers_to_proxy.clone(),
      &load_balancer_hostname,
      endpoint).await;

    match result {
      Ok(good_response) => {
        // All we want to do is add our special header
        return modify_response(good_response, proxy_hostname, attempt);
      },
      Err(_) => {},
    }

    attempt += 1;

    thread::sleep(Duration::from_millis(retry_wait_ms)); // TODO: Needs backoff + jitter

    if attempt >= max_retries {
      return Err(ErrorResponse {
        error_type: ErrorType::ProxyError,
        error_description: "max internal retry attempts reached".to_string(),
      });
    }
  }
}

#[derive(Serialize, Debug)]
pub struct ResponseError {
  pub reason: String,
}

async fn speak_proxy(
  ip_addr: IpAddr,
  internal_speak_request: InternalSpeakRequest,
  headers: HeaderMap<HeaderValue>,
  load_balancer_hostname: &str,
  endpoint: &'static str) -> Result<Response<Body>, ()>
{
  info!("Routing {} for {} to {} (attempt # {})", endpoint, &internal_speak_request.speaker,
        &load_balancer_hostname, internal_speak_request.retry_attempt_number);

  let mut request_builder = Request::builder()
    .method(Method::POST)
    .uri(endpoint);

  for (k, v) in headers.iter() {
    // NB: Handling move because of builder class
    request_builder = request_builder.header(k, v);
  }

  let json_speak_request = serde_json::to_string(&internal_speak_request).unwrap();

  let request = request_builder
    .body(Body::from(json_speak_request))
    .unwrap();

  match hyper_reverse_proxy::call(ip_addr, &load_balancer_hostname, request).await {
    Ok(result) => Ok(result),
    Err(_result) => Err(()), // TODO: Surface this?
  }
}

fn modify_response(response: Response<Body>, proxy_hostname: &str, retry_count: u8)
  -> Result<Response<Body>, ErrorResponse>
{
  let status = response.status();

  let response_headers = {
    let mut response_headers = response.headers().clone();

    let proxy_hostname = HeaderValue::from_str(proxy_hostname)
      .ok()
      .unwrap_or(HeaderValue::from_static("proxy-unknown"));

    let retry_count = HeaderValue::from_str(&retry_count.to_string())
      .ok()
      .unwrap_or(HeaderValue::from_static("unknown"));

    response_headers.append(HeaderName::from_static("x-proxy-hostname"), proxy_hostname);
    response_headers.append(HeaderName::from_static("x-retry-count"), retry_count);
    response_headers
  };

  let (_parts, body) = response.into_parts();

  let mut response_builder = Response::builder()
    .status(status);

  for header in response_headers {
    if let Some(header_name) = header.0.as_ref() {
      response_builder = response_builder.header(header_name, header.1);
    }
  }

  response_builder.body(body)
    .map_err(|_| ErrorResponse {
      error_type: ErrorType::ProxyError,
      error_description: "could not modify response".to_string()
    })
}