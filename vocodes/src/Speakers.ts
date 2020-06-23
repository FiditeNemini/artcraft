
class Speaker {
  name: string;
  slug: string;
  description: string;

  constructor(name: string, slug: string, description: string) {
    this.name = name;
    this.slug = slug;
    this.description = description;
  }

  static fromJson(json: any) : Speaker {
    return new Speaker(json.name, json.slug, json.description);
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
}

const SPEAKERS : Speaker[] = [
  Speaker.fromJson({
    name: "Donald Trump (single-speaker model)",
    slug: "trump",
    description: "The 45th President of the United States.",
  }),
  Speaker.fromJson({
    name: "Ronald Reagan (single-speaker model)",
    slug: "glow-solo-reagan",
    description: "The 40th President of the United States.",
  }),
  Speaker.fromJson({
    name: "Donald Trump (multi-speaker model)",
    slug: "glow-multi-trump",
    description: "The 45th President of the United States.",
  }),
  Speaker.fromJson({
    name: "John Oliver (multi-speaker model)",
    slug: "glow-multi-oliver",
    description: "TV news.",
  }),
  Speaker.fromJson({
    name: "Bill Gates (multi-speaker model)",
    slug: "glow-multi-gates",
    description: "Microsoft.",
  }),
  Speaker.fromJson({
    name: "Arnold Schwarzenegger (multi-speaker model)",
    slug: "glow-multi-arnold",
    description: "Terminator.",
  }),
  Speaker.fromJson({
    name: "Ronald Reagan (multi-speaker model)",
    slug: "glow-multi-reagan",
    description: "The 40th President of the United States.",
  }),
];

export { Speaker, SPEAKERS };
