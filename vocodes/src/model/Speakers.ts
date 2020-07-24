
class Speaker {
  name: string;
  slug: string;
  defaultVoice: boolean;
  description: string;
  avatarUrl?: string;
  fullUrl?: string;
  voiceQuality?: number;

  constructor(name: string, slug: string, description: string, avatarUrl?: string, fullUrl?: string, voiceQuality?: number, defaultVoice?: boolean) {
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.avatarUrl = avatarUrl;
    this.fullUrl = fullUrl;
    this.voiceQuality = voiceQuality;
    this.defaultVoice = defaultVoice !== undefined && defaultVoice;
  }

  static fromJson(json: any) : Speaker {
    return new Speaker(json.name, json.slug, json.description, json.avatarUrl, json.fullUrl, json.voiceQuality, json.defaultVoice);
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

  getVoiceQuality() : number {
    return this.voiceQuality === undefined ? 0.0 : this.voiceQuality;
  }

  isDefaultVoice(): boolean {
    return this.defaultVoice;
  }
}

const SPEAKERS : Speaker[] = [
  Speaker.fromJson({
    name: "Alan Rickman",
    slug: "alan-rickman",
    description: "Actor",
    avatarUrl: "snape.jpg",
    fullUrl: "alan-rickman-full.png",
    voiceQuality: 6.0,
  }),
  Speaker.fromJson({
    name: "Anderson Cooper",
    slug: "anderson-cooper",
    description: "Reporter",
    avatarUrl: "anderson-cooper.jpg",
    fullUrl: "anderson-cooper-full.png",
    voiceQuality: 4.9,
  }),
  Speaker.fromJson({
    name: "Arnold Schwarzenegger",
    slug: "arnold-schwarzenegger",
    description: "Terminator.",
    avatarUrl: "arnold-schwarzenegger.jpg",
    fullUrl: "arnold-schwarzenegger-full.png",
    voiceQuality: 2.0,
  }),
  Speaker.fromJson({
    name: "Ben Stein",
    slug: "ben-stein",
    description: "Actor and commentator.",
    avatarUrl: "ben-stein.jpg",
    fullUrl: "ben-stein-full.png",
    voiceQuality: 5.0,
  }),
  Speaker.fromJson({
    name: "Betty White",
    slug: "betty-white",
    description: "Actress.",
    avatarUrl: "betty-white.jpg",
    fullUrl: "betty-white-full.png",
    voiceQuality: 7.3,
  }),
  Speaker.fromJson({
    name: "Bill Gates",
    slug: "bill-gates",
    description: "Microsoft.",
    avatarUrl: "bill-gates.jpg",
    fullUrl: "bill-gates-full.png",
    voiceQuality: 6.3,
  }),
  Speaker.fromJson({
    name: "Bill Nye",
    slug: "bill-nye",
    description: "The Science Guy.",
    avatarUrl: "bill-nye.jpg",
    fullUrl: "bill-nye-full.png",
    voiceQuality: 6.7,
  }),
  Speaker.fromJson({
    name: "Bryan Cranston",
    slug: "bryan-cranston",
    description: "Actor.",
    avatarUrl: "bryan-cranston.jpg",
    fullUrl: "bryan-cranston-full.png",
    voiceQuality: 7.1,
  }),
  Speaker.fromJson({
    name: "Christopher Lee",
    slug: "christopher-lee",
    description: "An actor well known for playing Count Dooku and Saruman.",
    avatarUrl: "christopher-lee.jpg",
    fullUrl: "christopher-lee-full.png",
    voiceQuality: 6.5,
  }),
  Speaker.fromJson({
    name: "Craig Ferguson",
    slug: "craig-ferguson",
    description: "Night show host.",
    avatarUrl: "craig-ferguson.jpg",
    fullUrl: "craig-ferguson-full.png",
    voiceQuality: 7.9,
  }),
  Speaker.fromJson({
    name: "Danny Devito",
    slug: "danny-devito",
    description: "Always delightful.",
    avatarUrl: "danny-devito.jpg",
    fullUrl: "danny-devito-full.png",
    voiceQuality: 6.9,
  }),
  Speaker.fromJson({
    name: "David Cross",
    slug: "david-cross",
    description: "Actor.",
    avatarUrl: "david-cross.jpg",
    fullUrl: "david-cross-full.png",
    voiceQuality: 5.8,
  }),
  Speaker.fromJson({
    name: "Dr. Phil McGraw",
    slug: "dr-phil-mcgraw",
    description: "Celebrity doctor.",
    avatarUrl: "dr-phil-mcgraw.jpg",
    fullUrl: "dr-phil-mcgraw-full.png",
    voiceQuality: 6.1,
  }),
  Speaker.fromJson({
    name: "George Takei",
    slug: "george-takei",
    description: "Actor.",
    avatarUrl: "george-takei.jpg",
    fullUrl: "george-takei-full.png",
    voiceQuality: 0.0,
  }),
  Speaker.fromJson({
    name: "Gilbert Gottfried",
    slug: "gilbert-gottfried",
    description: "Voice actor and comedian.",
    avatarUrl: "gilbert-gottfried.jpg",
    fullUrl: "gilbert-gottfried-full.png",
    voiceQuality: 6.2,
  }),
  Speaker.fromJson({
    name: "Hillary Clinton",
    slug: "hillary-clinton",
    description: "Politics.",
    avatarUrl: "hillary-clinton.jpg",
    fullUrl: "hillary-clinton-full.png",
    voiceQuality: 5.5,
  }),
  Speaker.fromJson({
    name: "J. K. Simmons",
    slug: "j-k-simmons",
    description: "Actor",
    avatarUrl: "j-k-simmons.jpg",
    fullUrl: "j-k-simmons-full.png",
    voiceQuality: 6.2,
  }),
  Speaker.fromJson({
    name: "James Earl Jones",
    slug: "james-earl-jones",
    description: "Actor and voice actor.",
    avatarUrl: "darth-vader.jpg",
    fullUrl: "james-earl-jones-full.png",
    voiceQuality: 5.5,
  }),
  Speaker.fromJson({
    name: "John Oliver",
    slug: "john-oliver",
    description: "TV news.",
    avatarUrl: "john-oliver.jpg",
    fullUrl: "john-oliver-full.png",
    voiceQuality: 5.2,
  }),
  Speaker.fromJson({
    name: "Judi Dench",
    slug: "judi-dench",
    description: "Actress",
    avatarUrl: "judi-dench.jpg",
    fullUrl: "judi-dench-full.png",
    voiceQuality: 6.3,
  }),
  Speaker.fromJson({
    name: "Larry King",
    slug: "larry-king",
    description: "Reporter",
    avatarUrl: "larry-king.jpg",
    fullUrl: "larry-king-full.png",
    voiceQuality: 4.8,
  }),
  Speaker.fromJson({
    name: "Leonard Nimoy",
    slug: "leonard-nimoy",
    description: "Actor",
    avatarUrl: "spock.jpg",
    fullUrl: "leonard-nimoy-full.png",
    voiceQuality: 5.9,
  }),
  Speaker.fromJson({
    name: "Mark Zuckerberg",
    slug: "mark-zuckerberg",
    description: "Facebook.",
    avatarUrl: "mark-zuckerberg.jpg",
    fullUrl: "mark-zuckerberg-full.png",
    voiceQuality: 4.9,
  }),
  Speaker.fromJson({
    name: "Mr. Fred Rogers",
    slug: "fred-rogers",
    description: "Educator and amazing human being.",
    avatarUrl: "fred-rogers.jpg",
    fullUrl: "fred-rogers-full.png",
    voiceQuality: 4.9,
  }),
  Speaker.fromJson({
    name: "Neil deGrasse Tyson",
    slug: "neil-degrasse-tyson",
    description: "Total badass",
    avatarUrl: "neil-degrasse-tyson.jpg",
    fullUrl: "neil-degrasse-tyson-full.png",
    voiceQuality: 6.4,
  }),
  Speaker.fromJson({
    name: "Paul Graham",
    slug: "paul-graham",
    description: "Entrepreneur",
    avatarUrl: "paul-graham.jpg",
    fullUrl: "paul-graham-full.png",
    voiceQuality: 2.0,
  }),
  Speaker.fromJson({
    name: "Peter Thiel",
    slug: "peter-thiel",
    description: "Entrepreneur",
    avatarUrl: "peter-thiel.jpg",
    fullUrl: "peter-thiel-full.png",
    voiceQuality: 5.1,
  }),
  Speaker.fromJson({
    name: "President #37 Richard Nixon",
    slug: "richard-nixon",
    description: "The 37th President of the United States",
    avatarUrl: "richard-nixon.jpg",
    fullUrl: "richard-nixon-full.png",
    voiceQuality: 6.0,
  }),
  Speaker.fromJson({
    name: "President #39 Jimmy Carter",
    slug: "jimmy-carter",
    description: "The 39th President of the United States.",
    avatarUrl: "jimmy-carter.jpg",
    fullUrl: "jimmy-carter-full.png",
    voiceQuality: 6.3,
  }),
  Speaker.fromJson({
    name: "President #40 Ronald Reagan",
    slug: "ronald-reagan",
    description: "The 40th President of the United States.",
    avatarUrl: "ronald-reagan.jpg",
    fullUrl: "ronald-reagan-full.png",
    voiceQuality: 6.4,
  }),
  Speaker.fromJson({
    name: "President #42 Bill Clinton",
    slug: "bill-clinton",
    description: "The 42nd President of the United States.",
    avatarUrl: "bill-clinton.jpg",
    fullUrl: "bill-clinton-full.png",
    voiceQuality: 6.5,
  }),
  Speaker.fromJson({
    name: "President #43 George W. Bush",
    slug: "george-w-bush",
    description: "The 43th President of the United States.",
    avatarUrl: "george-w-bush.jpg",
    fullUrl: "george-w-bush-full.png",
    voiceQuality: 7.4,
  }),
  Speaker.fromJson({
    name: "President #44 Barack Obama",
    slug: "barack-obama",
    description: "The 44th President of the United States.",
    avatarUrl: "barack-obama.jpg",
    fullUrl: "barack-obama-full.png",
    voiceQuality: 4.2,
  }),
  Speaker.fromJson({
    name: "President #45 Donald Trump",
    slug: "donald-trump",
    description: "The 45th President of the United States.",
    avatarUrl: "donald-trump.jpg",
    fullUrl: "donald-trump-full.png",
    voiceQuality: 5.2,
  }),
  Speaker.fromJson({
    name: "Sam Altman",
    slug: "sam-altman",
    description: "Entrepreneur",
    avatarUrl: "sam-altman.jpg",
    fullUrl: "sam-altman-full.png",
    voiceQuality: 6.0,
  }),
  Speaker.fromJson({
    name: "Sir David Attenborough",
    slug: "david-attenborough",
    description: "Naturalist.",
    avatarUrl: "david-attenborough.jpg",
    fullUrl: "david-attenborough-full.png",
    voiceQuality: 8.0,
    defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "Tupac Shakur (acapella lyrics)",
    slug: "tupac-shakur",
    description: "Musician.",
    avatarUrl: "tupac-shakur.jpg",
    fullUrl: "tupac-shakur-full.png",
    voiceQuality: 5.0,
  }),
];

export { Speaker, SPEAKERS };
