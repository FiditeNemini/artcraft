
class VideoTemplate {
  name: string;
  slug: string;
  thumbnail: string;

  constructor(
    name: string,
    slug: string,
    thumbnail: string,
  ) {
    this.name = name;
    this.slug = slug;
    this.thumbnail = thumbnail;
  }

  static fromJson(json: any) : VideoTemplate {
    return new VideoTemplate(
      json.name,
      json.slug,
      json.thumbnail,
    );
  }

  getThumbnailUrl() : string {
    return `/video-thumbnails/${this.thumbnail}`;
  }
}


const VIDEO_TEMPLATES : VideoTemplate[] = [
  VideoTemplate.fromJson({
    name: "Donald Trump",
    slug: "trump-election-night.mp4",
    thumbnail: "donald-trump.webp",
  }),
  VideoTemplate.fromJson({
    name: "Dr. Phil",
    slug: "dr-phil-bubble.mp4",
    thumbnail: "dr-phil.webp",
  }),
];

export { VideoTemplate, VIDEO_TEMPLATES }
