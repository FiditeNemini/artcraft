
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
    name: "Donald Trump",
    slug: "trump",
    description: "The 45th President of the United States.",
    avatarUrl: "donald-trump.jpg",
  }),
  Speaker.fromJson({
    name: "Ronald Reagan",
    slug: "glow-solo-reagan",
    description: "The 40th President of the United States.",
    avatarUrl: "ronald-reagan.jpg",
  }),
  Speaker.fromJson({
    name: "John Oliver",
    slug: "glow-solo-oliver",
    description: "TV news.",
    avatarUrl: "john-oliver.jpg",
  }),
  Speaker.fromJson({
    name: "Bill Gates",
    slug: "glow-solo-billgates",
    description: "Microsoft.",
    avatarUrl: "bill-gates.jpg",
  }),
  Speaker.fromJson({
    name: "Mark Zuckerberg",
    slug: "glow-solo-zuckerberg",
    description: "Facebook.",
    avatarUrl: "mark-zuckerberg.jpg",
  }),
  Speaker.fromJson({
    name: "Arnold Schwarzenegger (multi-speaker model*)",
    slug: "glow-multi-arnold",
    description: "Terminator.",
    avatarUrl: "arnold-schwarzenegger.jpg",
  }),
];

export { Speaker, SPEAKERS };
