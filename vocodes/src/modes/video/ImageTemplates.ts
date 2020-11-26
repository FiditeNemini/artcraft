
class ImageTemplate {
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

  static fromJson(json: any) : ImageTemplate {
    return new ImageTemplate(
      json.name,
      json.slug,
      json.thumbnail,
    );
  }

  getThumbnailUrl() : string {
    return `/image-thumbnails/${this.thumbnail}`;
  }
}


const IMAGE_TEMPLATES : ImageTemplate[] = [
  ImageTemplate.fromJson({
    name: "Bill Gates",
    slug: "bill-gates.jpg",
    thumbnail: "bill-gates.jpg",
  }),
  ImageTemplate.fromJson({
    name: "Elon Musk",
    slug: "elon-musk.jpg",
    thumbnail: "elon-musk.jpg",
  }),
  ImageTemplate.fromJson({
    name: "Hillary Clinton",
    slug: "hillary-clinton-laugh.jpg",
    thumbnail: "hillary-clinton-laugh.jpg",
  }),
  ImageTemplate.fromJson({
    name: "Markiplier",
    slug: "markiplier.jpg",
    thumbnail: "markiplier.jpg",
  }),
  ImageTemplate.fromJson({
    name: "Solid Snake",
    slug: "solid-snake.jpg",
    thumbnail: "solid-snake.jpg",
  }),
  ImageTemplate.fromJson({
    name: "Sonic",
    slug: "sonic-movie.jpg",
    thumbnail: "sonic-movie.jpg",
  }),
];

export { ImageTemplate, IMAGE_TEMPLATES }
