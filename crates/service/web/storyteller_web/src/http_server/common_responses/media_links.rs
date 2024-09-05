use once_cell::sync::Lazy;
use url::Url;
use utoipa::ToSchema;
use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use errors::AnyhowResult;

const FAKEYOU_CDN: Lazy<Url> = Lazy::new(|| Url::parse("https://cdn.fakeyou.com")
    .expect("should never fail"));

const STORYTELLER_CDN: Lazy<Url> = Lazy::new(|| Url::parse("https://cdn.storyteller.ai")
    .expect("should never fail"));

/// Links to media file locations (bucket, CDN, etc.)
#[derive(Serialize, ToSchema)]
pub struct MediaLinks {
  /// Primary link to the asset via the CDN.
  pub cdn_url: Url,

  /// Template to construct thumbnail URLs.
  /// Only relevant for image media files. (Video media files instead have
  /// video previews, which, in turn, have their own thumbnail templates.)
  pub maybe_thumbnail_template: Option<String>,

  /// Video preview images (still and animated gif) for mp4 video files.
  /// These are only set for video media files.
  pub maybe_video_previews: Option<VideoPreviews>,
}

#[derive(Serialize, ToSchema)]
pub struct VideoPreviews {
  /// A static single frame preview image of the video.
  pub still: Url,
  /// An animated gif preview of the video.
  pub animated: Url,
  /// A template used to construct the still thumbnail URL.
  pub still_thumbnail_template: String,
  /// A template used to construct the animated thumbnail URL.
  pub animated_thumbnail_template: String,
}

impl MediaLinks {
  pub fn from_media_path(
    bucket_path: &MediaFileBucketPath,
  ) -> MediaLinks {
    let mut cdn_url = FAKEYOU_CDN.clone();
    cdn_url.set_path(bucket_path.get_full_object_path_str());

    MediaLinks {
      cdn_url,
      maybe_thumbnail_template: None,
      maybe_video_previews: None,
    }
  }
}

enum ThumbnailType {
  Gif,
  Jpg
}

/// Only returns a thumbnail for images.
fn maybe_thumbnail_template(path: &str, thumbnail_type: ThumbnailType) -> Option<String> {
  if !path.ends_with(".jpg")
      && !path.ends_with(".png")
      && !path.ends_with(".gif") {
    return None;
  }

  let path = match thumbnail_type {
    ThumbnailType::Gif => {
      //let path = format!("/cdn-cgi/image/width={WIDTH},quality={QUALITY}{}-thumb.gif", path);
      Some("")
    },
    ThumbnailType::Jpg => {
      //let path = format!("/cdn-cgi/image/width={WIDTH},quality={QUALITY}{path}-thumb.gif", path);
      Some("")
    }
  };
  let path = "/cdn-cgi/image/width={WIDTH},quality={QUALITY}{...path...}-thumb.jpg";
  None
}

/*

BUCKET

https://storage.googleapis.com/vocodes-public/media/9/4/a/2/7/94a27nmbd0bqmd10tg0pp3hz45zytf67/fakeyou_94a27nmbd0bqmd10tg0pp3hz45zytf67.wav

CDN

https://cdn.fakeyou.com/cdn-cgi/image/width=360,quality=100/media/9/z/n/e/v/9znevgdkd75hfseda63b2nqh9g2tepa0/storyteller_9znevgdkd75hfseda63b2nqh9g2tepa0.mp4-thumb.gif


https://cdn.fakeyou.com/media/9/4/a/2/7/94a27nmbd0bqmd10tg0pp3hz45zytf67/fakeyou_94a27nmbd0bqmd10tg0pp3hz45zytf67.wav

 /media/9/z/n/e/v/9znevgdkd75hfseda63b2nqh9g2tepa0/storyteller_9znevgdkd75hfseda63b2nqh9g2tepa0.mp4-thumb.gif


 */