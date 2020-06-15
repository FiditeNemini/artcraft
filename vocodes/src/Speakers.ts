
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
    name: "Donald Trump",
    slug: "trump",
    description: "The 45th President of the United States.",
  }),
  Speaker.fromJson({
    name: "John F. Kennedy",
    slug: "jfk",
    description: "The 35th President of the United States.",
  }),
  Speaker.fromJson({
    name: "Arnold Schwarzenegger",
    slug: "arnold",
    description: "Terminator.",
  }),
  Speaker.fromJson({
    name: "Bill Gates",
    slug: "gates",
    description: "Microsoft.",
  }),
  Speaker.fromJson({
    name: "Mark Zuckerberg",
    slug: "zuckerberg",
    description: "Facebook.",
  }),
  Speaker.fromJson({
    name: "Ronald Reagan",
    slug: "reagan",
    description: "The 40th President of the United States.",
  }),
  Speaker.fromJson({
    name: "Queen Elizabeth II",
    slug: "queen",
    description: "The Queen.",
  }),
  Speaker.fromJson({
    name: "Mario",
    slug: "mario",
    description: "Plumber.",
  }),
  Speaker.fromJson({
    name: "Zapp Brannigan",
    slug: "zapp",
    description: "Commander.",
  }),
  Speaker.fromJson({
    name: "Morgan Freeman",
    slug: "freeman",
    description: "Otherwise known as the voice of God.",
  }),
];

export { Speaker, SPEAKERS };
