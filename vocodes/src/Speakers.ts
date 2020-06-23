
class Speaker {
  name: string;
  slug: string;
  description: string;
  avatarUrl?: string;

  constructor(name: string, slug: string, description: string, avatarUrl?: string) {
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.avatarUrl = avatarUrl;
  }

  static fromJson(json: any) : Speaker {
    return new Speaker(json.name, json.slug, json.description, json.avatarUrl);
  }

  getName() : string {
    return this.name;
  }

  getSlug() : string {
    return this.slug;
  }

  getDescription() : string {
    return this.description;
  }

  hasAvatar() : boolean {
    return this.avatarUrl !== undefined;
  }

  getAvatar() : string | undefined {
    return this.avatarUrl;
  }
}

const SPEAKERS : Speaker[] = [
  Speaker.fromJson({
    name: "Donald Trump (single-speaker model)",
    slug: "trump",
    description: "The 45th President of the United States.",
    avatarUrl: "donald-trump.jpg",
  }),
  Speaker.fromJson({
    name: "Ronald Reagan (single-speaker model)",
    slug: "glow-solo-reagan",
    description: "The 40th President of the United States.",
    avatarUrl: "ronald-reagan.jpg",
  }),
  Speaker.fromJson({
    name: "Donald Trump (multi-speaker model)",
    slug: "glow-multi-trump",
    description: "The 45th President of the United States.",
    avatarUrl: "donald-trump.jpg",
  }),
  Speaker.fromJson({
    name: "John Oliver (multi-speaker model)",
    slug: "glow-multi-oliver",
    description: "TV news.",
    avatarUrl: "john-oliver.jpg",
  }),
  Speaker.fromJson({
    name: "Bill Gates (multi-speaker model)",
    slug: "glow-multi-gates",
    description: "Microsoft.",
    avatarUrl: "bill-gates.jpg",
  }),
  Speaker.fromJson({
    name: "Arnold Schwarzenegger (multi-speaker model)",
    slug: "glow-multi-arnold",
    description: "Terminator.",
    avatarUrl: "arnold-schwarzenegger.jpg",
  }),
  Speaker.fromJson({
    name: "Ronald Reagan (multi-speaker model)",
    slug: "glow-multi-reagan",
    description: "The 40th President of the United States.",
    avatarUrl: "ronald-reagan.jpg",
  }),
];

export { Speaker, SPEAKERS };
