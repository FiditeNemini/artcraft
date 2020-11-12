
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
  VideoTemplate.fromJson({
    name: "Mark Zuckerberg",
    slug: "mark-zuckerberg-tophat.mp4",
    thumbnail: "mark-zuckerberg-tophat.webp",
  }),
  VideoTemplate.fromJson({
    name: "moistcr1tikal",
    slug: "moistcr1tikal.mp4",
    thumbnail: "moistcr1tikal.webp",
  }),
  VideoTemplate.fromJson({
    name: "Terminator",
    slug: "terminator-bar-short.mp4",
    thumbnail: "terminator-bar-short.webp",
  }),
  VideoTemplate.fromJson({
    name: "Tucker Carlson",
    slug: "tucker-carlson.mp4",
    thumbnail: "tucker-carlson.webp",
  }),
];

export { VideoTemplate, VIDEO_TEMPLATES }
