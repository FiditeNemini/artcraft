use once_cell::sync::Lazy;
use url::Url;
use utoipa::ToSchema;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;

const FAKEYOU_CDN_STR: &str = "https://cdn.fakeyou.com";

const STORYTELLER_CDN_STR: &str = "https://cdn.storyteller.ai";

const FAKEYOU_CDN: Lazy<Url> = Lazy::new(|| Url::parse(FAKEYOU_CDN_STR)
    .expect("should never fail"));

const STORYTELLER_CDN: Lazy<Url> = Lazy::new(|| Url::parse(STORYTELLER_CDN_STR)
    .expect("should never fail"));

// TODO(bt,2024-09-05): Worth reducing the quality at all?
const QUALITY : u8 = 95;

/// Which domain to generate CDN, etc. links for.
#[derive(Copy, Clone, Debug)]
pub enum MediaDomain {
  FakeYou,
  Storyteller,
}

impl MediaDomain {
  pub fn new_cdn_url(&self) -> Url {
    match self {
      MediaDomain::FakeYou => FAKEYOU_CDN.clone(),
      MediaDomain::Storyteller => STORYTELLER_CDN.clone(),
    }
  }
  pub fn cdn_url_str(&self) -> &'static str {
    match self {
      MediaDomain::FakeYou => FAKEYOU_CDN_STR,
      MediaDomain::Storyteller => STORYTELLER_CDN_STR,
    }
  }
}

/// Links to media file locations (bucket, CDN, etc.)
#[derive(Serialize, ToSchema, Debug, Clone, Eq, PartialEq)]
pub struct MediaLinks {
  /// Primary link to the asset via the CDN.
  pub cdn_url: Url,

  /// Template to construct thumbnail URLs.
  /// Replace the string `{WIDTH}` with the desired width.
  /// Only relevant for image media files. (Video media files instead have
  /// video previews, which, in turn, have their own thumbnail templates.)
  pub maybe_thumbnail_template: Option<String>,

  /// Video preview images (still and animated gif) for mp4 video files.
  /// These are only set for video media files.
  pub maybe_video_previews: Option<VideoPreviews>,
}

#[derive(Serialize, ToSchema, Debug, Clone, Eq, PartialEq)]
pub struct VideoPreviews {
  /// A static single frame preview image of the video.
  pub still: Url,
  /// An animated gif preview of the video.
  pub animated: Url,
  /// A template used to construct the still thumbnail URL.
  /// Replace the string `{WIDTH}` with the desired width.
  pub still_thumbnail_template: String,
  /// A template used to construct the animated thumbnail URL.
  /// Replace the string `{WIDTH}` with the desired width.
  pub animated_thumbnail_template: String,
}

impl MediaLinks {
  pub fn from_media_path(
    domain: MediaDomain,
    bucket_path: &MediaFileBucketPath,
  ) -> MediaLinks {
    let rooted_path = bucket_path.get_full_object_path_str();
    Self::from_rooted_path(domain, rooted_path)
  }

  pub fn from_rooted_path(
    domain: MediaDomain,
    rooted_path: &str,
  ) -> MediaLinks {
    let mut cdn_url = domain.new_cdn_url();
    cdn_url.set_path(rooted_path);
    MediaLinks {
      cdn_url,
      maybe_thumbnail_template: thumbnail_template(domain, rooted_path),
      maybe_video_previews: VideoPreviews::from_rooted_path(domain, rooted_path),
    }
  }
}

impl VideoPreviews {
  fn from_rooted_path(
    domain: MediaDomain,
    rooted_path: &str,
  ) -> Option<Self> {
    if !rooted_path.ends_with(".mp4") {
      return None;
    }
    Some(Self {
      still: video_preview(domain, rooted_path, PreviewType::Jpg),
      animated: video_preview(domain, rooted_path, PreviewType::Gif),
      still_thumbnail_template: video_preview_thumbnail_template(domain, rooted_path, PreviewType::Jpg),
      animated_thumbnail_template: video_preview_thumbnail_template(domain, rooted_path, PreviewType::Gif),
    })
  }
}

enum PreviewType {
  Gif,
  Jpg
}

/// Returns a jpeg or gif preview of the video.
fn video_preview(media_domain: MediaDomain, rooted_path: &str, thumbnail_type: PreviewType) -> Url {
  let host = media_domain.cdn_url_str();
  let rooted_path = match thumbnail_type {
    PreviewType::Gif => format!("{rooted_path}-thumb.gif"),
    PreviewType::Jpg => format!("{rooted_path}-thumb.jpg"),
  };
  let mut url = media_domain.new_cdn_url();
  url.set_path(&rooted_path);
  url
}

/// Returns a thumbnail template for image
fn thumbnail_template(media_domain: MediaDomain, rooted_path: &str) -> Option<String> {
  if !rooted_path.ends_with(".jpg")
      && !rooted_path.ends_with(".png")
      && !rooted_path.ends_with(".gif") {
    return None;
  }
  let host = media_domain.cdn_url_str();
  Some(format!("{host}/cdn-cgi/image/width={{WIDTH}},quality={QUALITY}{rooted_path}"))
}

/// Returns a thumbnail template for video
fn video_preview_thumbnail_template(media_domain: MediaDomain, rooted_path: &str, thumbnail_type: PreviewType) -> String {
  let host = media_domain.cdn_url_str();
  let rooted_path = match thumbnail_type {
    PreviewType::Gif => format!("{rooted_path}-thumb.gif"),
    PreviewType::Jpg => format!("{rooted_path}-thumb.jpg"),
  };
  format!("{host}/cdn-cgi/image/width={{WIDTH}},quality={QUALITY}{rooted_path}")
}


#[cfg(test)]
mod tests {
  use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;

  use crate::http_server::common_responses::media_links::MediaDomain;
  use crate::http_server::common_responses::media_links::MediaLinks;

  mod fakeyou {
    use super::*;

    const DOMAIN : MediaDomain = MediaDomain::FakeYou;

    mod rooted_path {
      use super::*;

      #[test]
      fn wav_file() {
        let links = MediaLinks::from_rooted_path(DOMAIN, "/foo/bar.wav");
        assert_eq!(links.cdn_url.as_str(), "https://cdn.fakeyou.com/foo/bar.wav");
        assert_eq!(links.maybe_thumbnail_template, None);
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn glb_file() {
        let links = MediaLinks::from_rooted_path(DOMAIN, "/foo/bar.glb");
        assert_eq!(links.cdn_url.as_str(), "https://cdn.fakeyou.com/foo/bar.glb");
        assert_eq!(links.maybe_thumbnail_template, None);
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn jpg_image() {
        let links = MediaLinks::from_rooted_path(DOMAIN, "/foo/bar.jpg");
        assert_eq!(links.cdn_url.as_str(), "https://cdn.fakeyou.com/foo/bar.jpg");
        assert_eq!(links.maybe_thumbnail_template, Some("https://cdn.fakeyou.com/cdn-cgi/image/width={WIDTH},quality=95/foo/bar.jpg".to_string()));
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn mp4_video() {
        let links = MediaLinks::from_rooted_path(DOMAIN, "/foo/bar.mp4");
        assert_eq!(links.cdn_url.as_str(), "https://cdn.fakeyou.com/foo/bar.mp4");
        assert_eq!(links.maybe_thumbnail_template, None);
        let video_previews = links.maybe_video_previews.expect("should have previews");
        assert_eq!(video_previews.animated.as_str(), "https://cdn.fakeyou.com/foo/bar.mp4-thumb.gif");
        assert_eq!(video_previews.still.as_str(), "https://cdn.fakeyou.com/foo/bar.mp4-thumb.jpg");
        assert_eq!(video_previews.animated_thumbnail_template, "https://cdn.fakeyou.com/cdn-cgi/image/width={WIDTH},quality=95/foo/bar.mp4-thumb.gif");
        assert_eq!(video_previews.still_thumbnail_template, "https://cdn.fakeyou.com/cdn-cgi/image/width={WIDTH},quality=95/foo/bar.mp4-thumb.jpg");
      }
    }

    mod media_path {
      use super::*;

      #[test]
      fn wav_file() {
        // https://storage.googleapis.com/vocodes-public/media/9/4/a/2/7/94a27nmbd0bqmd10tg0pp3hz45zytf67/fakeyou_94a27nmbd0bqmd10tg0pp3hz45zytf67.wav
        let media_path = MediaFileBucketPath::from_object_hash("94a27nmbd0bqmd10tg0pp3hz45zytf67", Some("fakeyou_"), Some(".wav"));
        let links = MediaLinks::from_media_path(DOMAIN, &media_path);
        assert_eq!(links.cdn_url.as_str(), "https://cdn.fakeyou.com/media/9/4/a/2/7/94a27nmbd0bqmd10tg0pp3hz45zytf67/fakeyou_94a27nmbd0bqmd10tg0pp3hz45zytf67.wav");
        assert_eq!(links.maybe_thumbnail_template, None);
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn png_image() {
        /// https://storage.googleapis.com/vocodes-public/media/3/7/m/b/3/37mb3gh8fmj85y21thvbv08bzv24atjt/upload_37mb3gh8fmj85y21thvbv08bzv24atjt.png
        let media_path = MediaFileBucketPath::from_object_hash("37mb3gh8fmj85y21thvbv08bzv24atjt", Some("upload_"), Some(".png"));
        let links = MediaLinks::from_media_path(DOMAIN, &media_path);
        assert_eq!(links.cdn_url.as_str(), "https://cdn.fakeyou.com/media/3/7/m/b/3/37mb3gh8fmj85y21thvbv08bzv24atjt/upload_37mb3gh8fmj85y21thvbv08bzv24atjt.png");
        assert_eq!(links.maybe_thumbnail_template, Some("https://cdn.fakeyou.com/cdn-cgi/image/width={WIDTH},quality=95/media/3/7/m/b/3/37mb3gh8fmj85y21thvbv08bzv24atjt/upload_37mb3gh8fmj85y21thvbv08bzv24atjt.png".to_string()));
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn mp4_video() {
        // https://storage.googleapis.com/vocodes-public/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4
        let media_path = MediaFileBucketPath::from_object_hash("t6cnyw4g3e8k7carkk2bvrt6nd3fycjv", Some("storyteller_"), Some(".mp4"));
        let links = MediaLinks::from_media_path(DOMAIN, &media_path);
        assert_eq!(links.cdn_url.as_str(), "https://cdn.fakeyou.com/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4");
        assert_eq!(links.maybe_thumbnail_template, None);
        let video_previews = links.maybe_video_previews.expect("should have previews");
        assert_eq!(video_previews.animated.as_str(), "https://cdn.fakeyou.com/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4-thumb.gif");
        assert_eq!(video_previews.still.as_str(), "https://cdn.fakeyou.com/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4-thumb.jpg");
        assert_eq!(video_previews.animated_thumbnail_template, "https://cdn.fakeyou.com/cdn-cgi/image/width={WIDTH},quality=95/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4-thumb.gif");
        assert_eq!(video_previews.still_thumbnail_template, "https://cdn.fakeyou.com/cdn-cgi/image/width={WIDTH},quality=95/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4-thumb.jpg");
      }
    }
  }

  mod storyteller {
    use super::*;

    const DOMAIN : MediaDomain = MediaDomain::Storyteller;

    mod rooted_path {
      use super::*;

      #[test]
      fn wav_file() {
        let links = MediaLinks::from_rooted_path(DOMAIN, "/foo/bar.wav");
        assert_eq!(links.cdn_url.as_str(), "https://cdn.storyteller.ai/foo/bar.wav");
        assert_eq!(links.maybe_thumbnail_template, None);
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn glb_file() {
        let links = MediaLinks::from_rooted_path(DOMAIN, "/foo/bar.glb");
        assert_eq!(links.cdn_url.as_str(), "https://cdn.storyteller.ai/foo/bar.glb");
        assert_eq!(links.maybe_thumbnail_template, None);
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn jpg_image() {
        let links = MediaLinks::from_rooted_path(DOMAIN, "/foo/bar.jpg");
        assert_eq!(links.cdn_url.as_str(), "https://cdn.storyteller.ai/foo/bar.jpg");
        assert_eq!(links.maybe_thumbnail_template, Some("https://cdn.storyteller.ai/cdn-cgi/image/width={WIDTH},quality=95/foo/bar.jpg".to_string()));
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn mp4_video() {
        let links = MediaLinks::from_rooted_path(DOMAIN, "/foo/bar.mp4");
        assert_eq!(links.cdn_url.as_str(), "https://cdn.storyteller.ai/foo/bar.mp4");
        assert_eq!(links.maybe_thumbnail_template, None);
        let video_previews = links.maybe_video_previews.expect("should have previews");
        assert_eq!(video_previews.animated.as_str(), "https://cdn.storyteller.ai/foo/bar.mp4-thumb.gif");
        assert_eq!(video_previews.still.as_str(), "https://cdn.storyteller.ai/foo/bar.mp4-thumb.jpg");
        assert_eq!(video_previews.animated_thumbnail_template, "https://cdn.storyteller.ai/cdn-cgi/image/width={WIDTH},quality=95/foo/bar.mp4-thumb.gif");
        assert_eq!(video_previews.still_thumbnail_template, "https://cdn.storyteller.ai/cdn-cgi/image/width={WIDTH},quality=95/foo/bar.mp4-thumb.jpg");
      }
    }

    mod media_path {
      use super::*;

      #[test]
      fn wav_file() {
        // https://storage.googleapis.com/vocodes-public/media/9/4/a/2/7/94a27nmbd0bqmd10tg0pp3hz45zytf67/fakeyou_94a27nmbd0bqmd10tg0pp3hz45zytf67.wav
        let media_path = MediaFileBucketPath::from_object_hash("94a27nmbd0bqmd10tg0pp3hz45zytf67", Some("fakeyou_"), Some(".wav"));
        let links = MediaLinks::from_media_path(DOMAIN, &media_path);
        assert_eq!(links.cdn_url.as_str(), "https://cdn.storyteller.ai/media/9/4/a/2/7/94a27nmbd0bqmd10tg0pp3hz45zytf67/fakeyou_94a27nmbd0bqmd10tg0pp3hz45zytf67.wav");
        assert_eq!(links.maybe_thumbnail_template, None);
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn png_image() {
        /// https://storage.googleapis.com/vocodes-public/media/3/7/m/b/3/37mb3gh8fmj85y21thvbv08bzv24atjt/upload_37mb3gh8fmj85y21thvbv08bzv24atjt.png
        let media_path = MediaFileBucketPath::from_object_hash("37mb3gh8fmj85y21thvbv08bzv24atjt", Some("upload_"), Some(".png"));
        let links = MediaLinks::from_media_path(DOMAIN, &media_path);
        assert_eq!(links.cdn_url.as_str(), "https://cdn.storyteller.ai/media/3/7/m/b/3/37mb3gh8fmj85y21thvbv08bzv24atjt/upload_37mb3gh8fmj85y21thvbv08bzv24atjt.png");
        assert_eq!(links.maybe_thumbnail_template, Some("https://cdn.storyteller.ai/cdn-cgi/image/width={WIDTH},quality=95/media/3/7/m/b/3/37mb3gh8fmj85y21thvbv08bzv24atjt/upload_37mb3gh8fmj85y21thvbv08bzv24atjt.png".to_string()));
        assert_eq!(links.maybe_video_previews, None);
      }

      #[test]
      fn mp4_video() {
        // https://storage.googleapis.com/vocodes-public/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4
        let media_path = MediaFileBucketPath::from_object_hash("t6cnyw4g3e8k7carkk2bvrt6nd3fycjv", Some("storyteller_"), Some(".mp4"));
        let links = MediaLinks::from_media_path(DOMAIN, &media_path);
        assert_eq!(links.cdn_url.as_str(), "https://cdn.storyteller.ai/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4");
        assert_eq!(links.maybe_thumbnail_template, None);
        let video_previews = links.maybe_video_previews.expect("should have previews");
        assert_eq!(video_previews.animated.as_str(), "https://cdn.storyteller.ai/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4-thumb.gif");
        assert_eq!(video_previews.still.as_str(), "https://cdn.storyteller.ai/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4-thumb.jpg");
        assert_eq!(video_previews.animated_thumbnail_template, "https://cdn.storyteller.ai/cdn-cgi/image/width={WIDTH},quality=95/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4-thumb.gif");
        assert_eq!(video_previews.still_thumbnail_template, "https://cdn.storyteller.ai/cdn-cgi/image/width={WIDTH},quality=95/media/t/6/c/n/y/t6cnyw4g3e8k7carkk2bvrt6nd3fycjv/storyteller_t6cnyw4g3e8k7carkk2bvrt6nd3fycjv.mp4-thumb.jpg");
      }
    }
  }
}
