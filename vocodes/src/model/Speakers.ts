
class Speaker {
  name: string;
  slug: string;
  description: string;
  avatarUrl?: string;
  fullUrl?: string;

  constructor(name: string, slug: string, description: string, avatarUrl?: string, fullUrl?: string) {
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.avatarUrl = avatarUrl;
    this.fullUrl = fullUrl;
  }

  static fromJson(json: any) : Speaker {
    return new Speaker(json.name, json.slug, json.description, json.avatarUrl, json.fullUrl);
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

  hasFull() : boolean {
    return this.fullUrl !== undefined;
  }

  getFull() : string | undefined {
    return this.fullUrl;
  }
}

const SPEAKERS : Speaker[] = [
  Speaker.fromJson({
    name: "Sir David Attenborough (high quality)",
    slug: "david-attenborough",
    description: "Naturalist",
    avatarUrl: "david-attenborough.jpg",
    fullUrl: "david-attenborough-full.png",
  }),
  Speaker.fromJson({
    name: "Betty White",
    slug: "betty-white",
    description: "This model needs more training.",
    avatarUrl: "betty-white.jpg",
    fullUrl: "betty-white-full.png",
  }),
  Speaker.fromJson({
    name: "Bill Gates (needs work)",
    slug: "bill-gates",
    description: "Microsoft.",
    avatarUrl: "bill-gates.jpg",
    fullUrl: "bill-gates-full.png",
  }),
  Speaker.fromJson({
    name: "Christopher Lee",
    slug: "christopher-lee",
    description: "An actor well known for playing Count Dooku and Saruman.",
    avatarUrl: "christopher-lee.jpg",
    fullUrl: "christopher-lee-full.png",
  }),
  Speaker.fromJson({
    name: "Danny Devito",
    slug: "danny-devito",
    description: "Always delightful.",
    avatarUrl: "danny-devito.jpg",
    fullUrl: "danny-devito-full.png",
  }),
  Speaker.fromJson({
    name: "Dr. Phil McGraw",
    slug: "dr-phil-mcgraw",
    description: "Celebrity doctor.",
    avatarUrl: "dr-phil-mcgraw.jpg",
    fullUrl: "dr-phil-mcgraw-full.png",
  }),
  Speaker.fromJson({
    name: "Gilbert Gottfried",
    slug: "gilbert-gottfried",
    description: "Voice actor and comedian.",
    avatarUrl: "gilbert-gottfried.jpg",
    fullUrl: "gilbert-gottfried-full.png",
  }),
  Speaker.fromJson({
    name: "John Oliver",
    slug: "john-oliver",
    description: "TV news.",
    avatarUrl: "john-oliver.jpg",
    fullUrl: "john-oliver-full.png",
  }),
  Speaker.fromJson({
    name: "Mark Zuckerberg (needs work)",
    slug: "mark-zuckerberg",
    description: "Facebook.",
    avatarUrl: "mark-zuckerberg.jpg",
    fullUrl: "mark-zuckerberg-full.png",
  }),
  Speaker.fromJson({
    name: "Mr. Fred Rogers",
    slug: "fred-rogers",
    description: "Educator and amazing human being.",
    avatarUrl: "fred-rogers.jpg",
    fullUrl: "fred-rogers-full.png",
  }),
  Speaker.fromJson({
    name: "President #37 Richard Nixon",
    slug: "richard-nixon",
    description: "The 37th President of the United States",
    avatarUrl: "richard-nixon.jpg",
    fullUrl: "richard-nixon-full.png",
  }),
  Speaker.fromJson({
    name: "President #40 Ronald Reagan",
    slug: "ronald-reagan",
    description: "The 40th President of the United States.",
    avatarUrl: "ronald-reagan.jpg",
    fullUrl: "ronald-reagan-full.png",
  }),
  Speaker.fromJson({
    name: "President #42 Bill Clinton",
    slug: "bill-clinton",
    description: "The 42nd President of the United States.",
    avatarUrl: "bill-clinton.jpg",
    fullUrl: "bill-clinton-full.png",
  }),
  Speaker.fromJson({
    name: "President #44 Barack Obama (needs more training)",
    slug: "barack-obama",
    description: "The 44th President of the United States.",
    avatarUrl: "barack-obama.jpg",
    fullUrl: "barack-obama-full.png",
  }),
  Speaker.fromJson({
    name: "President #45 Donald Trump",
    slug: "donald-trump",
    description: "The 45th President of the United States.",
    avatarUrl: "donald-trump.jpg",
    fullUrl: "donald-trump-full.png",
  }),
  Speaker.fromJson({
    name: "[outdated architecture] Arnold Schwarzenegger",
    slug: "arnold-schwarzenegger",
    description: "Terminator.",
    avatarUrl: "arnold-schwarzenegger.jpg",
    fullUrl: "arnold-schwarzenegger-full.png",
  }),
];

export { Speaker, SPEAKERS };
