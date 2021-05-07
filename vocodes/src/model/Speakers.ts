class SpeakerCategory {
  name: string;
  slug: string;

  constructor(name: string, slug: string) {
    this.name = name;
    this.slug = slug;
  }

  getName(): string {
    return this.name;
  }

  getSlug(): string {
    return this.slug;
  }
}

const CATEGORY_ALL: SpeakerCategory = new SpeakerCategory("All Voices", "all");

const SPEAKER_CATEGORIES : Map<String, SpeakerCategory> = new Map([
  ["all", CATEGORY_ALL],
  ["cartoons", new SpeakerCategory("Cartoons and Anime", "cartoons")],
  ["celebrities", new SpeakerCategory("Celebrities", "celebrities")],
  ["games", new SpeakerCategory("Video Games", "games")],
  ["presidents", new SpeakerCategory("U.S. Presidents", "presidents")],
  ["politics", new SpeakerCategory("Politics", "politics")],
  ["musicians", new SpeakerCategory("Musicians", "musicians")],
  ["streamers", new SpeakerCategory("Streamers and YouTubers", "streamers")],
  ["science", new SpeakerCategory("Science", "science")],
  ["tech", new SpeakerCategory("Technology", "tech")],
  ["news", new SpeakerCategory("News and Commentary", "news")],
  ["fantasy", new SpeakerCategory("Science Fiction and Fantasy", "fantasy")],
  ["meme", new SpeakerCategory("Popular Meme Voices", "meme")],
  ["new", new SpeakerCategory("Newly Added Voices", "new")],
]);

class Speaker {
  name: string;
  slug: string;

  // Used for speakers like "darth-vader" who are backed by "james-earl-jones".
  apiSlugOverride?: string;

  // Whether the voice is shown when the page first loads. If multiple, it's random.
  defaultVoice: boolean;

  description: string;
  avatarUrl?: string;
  fullUrl?: string;
  voiceQuality?: number;
  categories: SpeakerCategory[];

  constructor(
    name: string,
    slug: string,
    description: string,
    categories: SpeakerCategory[],
    avatarUrl?: string,
    fullUrl?: string,
    voiceQuality?: number,
    defaultVoice?: boolean,
    apiSlugOverride?: string)
  {
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.avatarUrl = avatarUrl;
    this.fullUrl = fullUrl;
    this.voiceQuality = voiceQuality;
    this.defaultVoice = defaultVoice !== undefined && defaultVoice;
    this.categories = categories;
    this.apiSlugOverride = apiSlugOverride;
  }

  static fromJson(json: any) : Speaker {
    let categories : SpeakerCategory[] = [];

    let inputCategories = json.categories || [];
    inputCategories.push('all');

    if (inputCategories) {
      inputCategories.forEach((categoryName : string) => {
        let category = SPEAKER_CATEGORIES.get(categoryName);
        if (category === undefined) {
          throw new Error(`Category not found: ${categoryName}`);
        }
        categories.push(category);
      });
    }

    return new Speaker(
      json.name,
      json.slug,
      json.description,
      categories,
      json.avatarUrl,
      json.fullUrl,
      json.voiceQuality,
      json.defaultVoice,
      json.apiSlugOverride
    );
  }

  getName() : string {
    return this.name;
  }

  getApiSlug(): string {
    if (this.apiSlugOverride !== undefined) {
      return this.apiSlugOverride;
    }
    return this.slug;
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

  getCategories(): SpeakerCategory[] {
    return [...this.categories];
  }
}

const SPEAKERS : Speaker[] = [
  Speaker.fromJson({
    name: "Alan Rickman",
    slug: "alan-rickman",
    description: "Actor",
    avatarUrl: "alan-rickman.jpg",
    fullUrl: "alan-rickman-full.png",
    voiceQuality: 6.0,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Anakin Skywalker",
    slug: "anakin-skywalker",
    description: "sand",
    avatarUrl: "anakin-skywalker.webp",
    fullUrl: "anakin-skywalker-full.webp",
    voiceQuality: 5.2,
    categories: ["cartoons", "fantasy", "new"],
  }),
  Speaker.fromJson({
    name: "Anderson Cooper",
    slug: "anderson-cooper",
    description: "Reporter",
    avatarUrl: "anderson-cooper.jpg",
    fullUrl: "anderson-cooper-full.png",
    voiceQuality: 4.9,
    categories: ["news"],
  }),
  Speaker.fromJson({
    name: "Arnold Schwarzenegger",
    slug: "arnold-schwarzenegger",
    description: "Terminator.",
    avatarUrl: "arnold-schwarzenegger.jpg",
    fullUrl: "arnold-schwarzenegger-full.png",
    voiceQuality: 8.0,
    categories: ["celebrities", "politics"],
    defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "Barack Obama",
    slug: "barack-obama",
    description: "The 44th President of the United States.",
    avatarUrl: "barack-obama.jpg",
    fullUrl: "barack-obama-full.png",
    voiceQuality: 4.2,
    categories: ["politics", "presidents"],
  }),
  Speaker.fromJson({
    name: "Bart Simpson",
    slug: "bart-simpson",
    description: "The Simpsons",
    avatarUrl: "bart-simpson.jpg",
    fullUrl: "bart-simpson-full.png",
    voiceQuality: 7.2,
    categories: ["cartoons"],
  }),
  Speaker.fromJson({
    name: "Ben Shapiro",
    slug: "ben-shapiro",
    description: "Commentator",
    avatarUrl: "ben-shapiro.jpg",
    fullUrl: "ben-shapiro-full.png",
    voiceQuality: 6.8,
    categories: ["politics", "news"],
  }),
  Speaker.fromJson({
    name: "Ben Stein",
    slug: "ben-stein",
    description: "Actor and commentator.",
    avatarUrl: "ben-stein.jpg",
    fullUrl: "ben-stein-full.png",
    voiceQuality: 5.0,
    categories: ["celebrities", "news"],
  }),
  Speaker.fromJson({
    name: "Betty White",
    slug: "betty-white",
    description: "Actress.",
    avatarUrl: "betty-white.jpg",
    fullUrl: "betty-white-full.png",
    voiceQuality: 7.3,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Bill Clinton",
    slug: "bill-clinton",
    description: "The 42nd President of the United States.",
    avatarUrl: "bill-clinton.jpg",
    fullUrl: "bill-clinton-full.png",
    voiceQuality: 6.5,
    categories: ["politics", "presidents"],
  }),
  Speaker.fromJson({
    name: "Bill Gates",
    slug: "bill-gates",
    description: "Microsoft.",
    avatarUrl: "bill-gates.jpg",
    fullUrl: "bill-gates-full.png",
    voiceQuality: 6.3,
    categories: ["tech"],
  }),
  Speaker.fromJson({
    name: "Bill Nye",
    slug: "bill-nye",
    description: "The Science Guy.",
    avatarUrl: "bill-nye.jpg",
    fullUrl: "bill-nye-full.png",
    voiceQuality: 6.7,
    categories: ["science"],
  }),
  Speaker.fromJson({
    name: "Bob Barker",
    slug: "bob-barker",
    description: "Price is right",
    avatarUrl: "happy-gilmore.webp",
    fullUrl: "bob-barker-full.png",
    voiceQuality: 8.5,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Boomstick (Death Battle!)",
    slug: "boomstick",
    description: "Rooster Teeth YouTube Show",
    avatarUrl: "boomstick.jpg",
    fullUrl: "boomstick-full.png",
    voiceQuality: 5.2,
    categories: ["streamers"],
  }),
  Speaker.fromJson({
    name: "The Boss",
    slug: "the-boss",
    description: "Metal Gear",
    avatarUrl: "the-boss-virgil.jpg",
    fullUrl: "the-boss-full.png",
    voiceQuality: 8.5,
    categories: ["games"],
  }),
  Speaker.fromJson({
    name: "Bryan Cranston",
    slug: "bryan-cranston",
    description: "Actor.",
    avatarUrl: "bryan-cranston.jpg",
    fullUrl: "bryan-cranston-full.png",
    voiceQuality: 7.1,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Christopher Lee",
    slug: "christopher-lee",
    description: "An actor well known for playing Count Dooku and Saruman.",
    avatarUrl: "christopher-lee.jpg",
    fullUrl: "christopher-lee-full.png",
    voiceQuality: 6.5,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Craig Ferguson",
    slug: "craig-ferguson",
    description: "Night show host.",
    avatarUrl: "craig-ferguson.jpg",
    fullUrl: "craig-ferguson-full.png",
    voiceQuality: 7.9,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Crypt Keeper",
    slug: "crypt-keeper",
    description: "Spooky",
    avatarUrl: "crypt-keeper.jpg",
    fullUrl: "crypt-keeper-full.png",
    voiceQuality: 6.5,
    categories: ["fantasy"],
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
    name: "Darth Vader",
    slug: "darth-vader",
    apiSlugOverride: "james-earl-jones",
    description: "Star Wars",
    avatarUrl: "darth-vader.jpg",
    fullUrl: "darth-vader-full.png",
    voiceQuality: 5.5,
    categories: ["fantasy"],
  }),
  Speaker.fromJson({
    name: "David Cross",
    slug: "david-cross",
    description: "Actor.",
    avatarUrl: "david-cross.jpg",
    fullUrl: "david-cross-full.png",
    voiceQuality: 5.8,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Donald Trump",
    slug: "donald-trump",
    description: "The 45th President of the United States.",
    avatarUrl: "donald-trump.jpg",
    fullUrl: "donald-trump-full.png",
    voiceQuality: 5.2,
    categories: ["politics", "presidents"],
  }),
  Speaker.fromJson({
    name: "Dr. Phil McGraw",
    slug: "dr-phil-mcgraw",
    description: "Celebrity doctor.",
    avatarUrl: "dr-phil-mcgraw.jpg",
    fullUrl: "dr-phil-mcgraw-full.png",
    voiceQuality: 6.1,
    categories: ["celebrities", "meme"],
  }),
  Speaker.fromJson({
    name: "Eric Cartman",
    slug: "eric-cartman",
    description: "Obnoxious.",
    avatarUrl: "eric-cartman.webp",
    fullUrl: "eric-cartman-full.png",
    voiceQuality: 6.6,
    categories: ["cartoons", "new"],
    defaultVoice: true,
  }),
  //Speaker.fromJson({
  //  name: "Etika",
  //  slug: "etika",
  //  description: "YouTuber.",
  //  avatarUrl: "etika-shock.webp",
  //  fullUrl: "etika-full.png",
  //  voiceQuality: 3.0,
  //  categories: ["streamers", "new"],
  //}),
  Speaker.fromJson({
    name: "George W. Bush",
    slug: "george-w-bush",
    description: "The 43th President of the United States.",
    avatarUrl: "george-w-bush.jpg",
    fullUrl: "george-w-bush-full.png",
    voiceQuality: 7.4,
    categories: ["politics", "presidents"],
  }),
  Speaker.fromJson({
    name: "George Takei",
    slug: "george-takei",
    description: "Actor.",
    avatarUrl: "george-takei.jpg",
    fullUrl: "george-takei-full.png",
    voiceQuality: 0.0,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Gilbert Gottfried",
    slug: "gilbert-gottfried",
    description: "Voice actor and comedian.",
    avatarUrl: "gilbert-gottfried.jpg",
    fullUrl: "gilbert-gottfried-full.png",
    voiceQuality: 7.8,
    categories: ["celebrities"],
    defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "Goku",
    slug: "goku",
    description: "Over 9000",
    avatarUrl: "goku.webp",
    fullUrl: "goku-full.png",
    voiceQuality: 7.8,
    categories: ["cartoons", "new"],
    defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "Hillary Clinton",
    slug: "hillary-clinton",
    description: "Politics.",
    avatarUrl: "hillary-clinton.jpg",
    fullUrl: "hillary-clinton-full.png",
    voiceQuality: 5.5,
    categories: ["politics"],
  }),
  Speaker.fromJson({
    name: "Homer Simpson",
    slug: "homer-simpson",
    description: "Naturalist.",
    avatarUrl: "homer-simpson.jpg",
    fullUrl: "homer-simpson-full.png",
    voiceQuality: 8.0,
    categories: ["cartoons"],
    defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "J. K. Simmons",
    slug: "j-k-simmons",
    description: "Actor",
    avatarUrl: "j-k-simmons.jpg",
    fullUrl: "j-k-simmons-full.png",
    voiceQuality: 6.2,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "James Earl Jones",
    slug: "james-earl-jones",
    description: "Actor and voice actor.",
    avatarUrl: "james-earl-jones.jpg",
    fullUrl: "james-earl-jones-full.png",
    voiceQuality: 5.5,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Jim Cramer",
    slug: "jim-cramer",
    description: "Stonks.",
    avatarUrl: "jim-cramer.jpg",
    fullUrl: "jim-cramer-full.png",
    voiceQuality: 8.5,
    categories: ["meme", "new", "news"],
  }),
  Speaker.fromJson({
    name: "Jimmy Carter",
    slug: "jimmy-carter",
    description: "The 39th President of the United States.",
    avatarUrl: "jimmy-carter.jpg",
    fullUrl: "jimmy-carter-full.png",
    voiceQuality: 6.3,
    categories: ["politics", "presidents"],
  }),
  Speaker.fromJson({
    name: "John Oliver",
    slug: "john-oliver",
    description: "TV news.",
    avatarUrl: "john-oliver.jpg",
    fullUrl: "john-oliver-full.png",
    voiceQuality: 5.2,
    categories: ["news", "politics"],
  }),
  Speaker.fromJson({
    name: "Judi Dench",
    slug: "judi-dench",
    description: "Actress",
    avatarUrl: "judi-dench.jpg",
    fullUrl: "judi-dench-full.png",
    voiceQuality: 6.3,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Larry King",
    slug: "larry-king",
    description: "Reporter",
    avatarUrl: "larry-king.jpg",
    fullUrl: "larry-king-full.png",
    voiceQuality: 4.8,
    categories: ["news"],
  }),
  Speaker.fromJson({
    name: "Leonard Nimoy",
    slug: "leonard-nimoy",
    description: "Actor",
    avatarUrl: "spock.jpg",
    fullUrl: "leonard-nimoy-full.png",
    voiceQuality: 5.9,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Lisa Simpson",
    slug: "lisa-simpson",
    description: "The Simpsons",
    avatarUrl: "lisa-simpson.jpg",
    fullUrl: "lisa-simpson-full.png",
    voiceQuality: 6.5,
    categories: ["cartoons"],
  }),
  Speaker.fromJson({
    name: "Mark Zuckerberg",
    slug: "mark-zuckerberg",
    description: "Facebook.",
    avatarUrl: "mark-zuckerberg.jpg",
    fullUrl: "mark-zuckerberg-full.png",
    voiceQuality: 4.9,
    categories: ["tech"],
  }),
  Speaker.fromJson({
    name: "Michael Rosen",
    slug: "michael-rosen",
    description: "Writer.",
    avatarUrl: "michael-rosen.jpg",
    fullUrl: "michael-rosen-full.png",
    voiceQuality: 6.5,
    categories: ["celebrities", "meme"],
  }),
  Speaker.fromJson({
    name: "Mitch McConnell",
    slug: "mitch-mcconnell",
    description: "Politician.",
    avatarUrl: "mitch-mcconnell.jpg",
    fullUrl: "mitch-mcconnel-full.png",
    voiceQuality: 8.5,
    categories: ["politics"],
  }),
  Speaker.fromJson({
    name: "moistcr1tikal",
    slug: "moistcr1tikal",
    description: "YouTuber.",
    avatarUrl: "moist.jpg",
    fullUrl: "moist-full.png",
    voiceQuality: 5.5,
    categories: ["streamers", "new"],
  }),
  Speaker.fromJson({
    name: "Mr. Fred Rogers",
    slug: "fred-rogers",
    description: "Educator and amazing human being.",
    avatarUrl: "fred-rogers.jpg",
    fullUrl: "fred-rogers-full.png",
    voiceQuality: 4.9,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Mr. Krabs",
    slug: "mr-krabs",
    description: "SpongeBob SquarePants",
    avatarUrl: "mr-krabs.jpg",
    fullUrl: "mr-krabs-full.png",
    voiceQuality: 5.5,
    categories: ["cartoons"],
  }),
  Speaker.fromJson({
    name: "Neil deGrasse Tyson",
    slug: "neil-degrasse-tyson",
    description: "Total badass",
    avatarUrl: "neil-degrasse-tyson.jpg",
    fullUrl: "neil-degrasse-tyson-full.png",
    voiceQuality: 6.4,
    categories: ["science"],
  }),
  Speaker.fromJson({
    name: "Obi-Wan Kenobi",
    slug: "obi-wan-kenobi",
    description: "Higher ground",
    avatarUrl: "obi-wan-kenobi.webp",
    fullUrl: "obi-wan-kenobi-full.webp",
    voiceQuality: 7.2,
    categories: ["cartoons", "fantasy", "new"],
  }),
  Speaker.fromJson({
    name: "Palmer Luckey",
    slug: "palmer-luckey",
    description: "Inventor, Entrepreneur",
    avatarUrl: "palmer-luckey.jpg",
    fullUrl: "palmer-luckey-full.png",
    voiceQuality: 6.3,
    categories: ["tech"],
  }),
  Speaker.fromJson({
    name: "Paul Graham",
    slug: "paul-graham",
    description: "Entrepreneur",
    avatarUrl: "paul-graham.jpg",
    fullUrl: "paul-graham-full.png",
    voiceQuality: 2.0,
    categories: ["tech"],
  }),
  Speaker.fromJson({
    name: "Paula Deen",
    slug: "paula-deen",
    description: "Cook",
    avatarUrl: "paula-deen.jpg",
    fullUrl: "paula-deen-full.png",
    voiceQuality: 8.4,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Peter Griffin",
    slug: "peter-griffin",
    description: "Family Guy.",
    avatarUrl: "peter-griffin.webp",
    fullUrl: "peter-griffin-full.png",
    voiceQuality: 7.0,
    categories: ["cartoons", "new"],
    defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "Peter Thiel",
    slug: "peter-thiel",
    description: "Entrepreneur",
    avatarUrl: "peter-thiel.jpg",
    fullUrl: "peter-thiel-full.png",
    voiceQuality: 7.0,
    categories: ["tech"],
  }),
  Speaker.fromJson({
    name: "Richard Ayoade",
    slug: "richard-ayoade",
    description: "Actor and comedian",
    avatarUrl: "moss-fire.webp",
    fullUrl: "richard-ayoade-full.png",
    voiceQuality: 6.5,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Richard Nixon",
    slug: "richard-nixon",
    description: "The 37th President of the United States",
    avatarUrl: "richard-nixon.jpg",
    fullUrl: "richard-nixon-full.png",
    voiceQuality: 6.0,
    categories: ["politics", "presidents"],
  }),
  Speaker.fromJson({
    name: "Ronald Reagan",
    slug: "ronald-reagan",
    description: "The 40th President of the United States.",
    avatarUrl: "ronald-reagan.jpg",
    fullUrl: "ronald-reagan-full.png",
    voiceQuality: 6.4,
    categories: ["politics", "presidents"],
  }),
  Speaker.fromJson({
    name: "Sam Altman",
    slug: "sam-altman",
    description: "Entrepreneur",
    avatarUrl: "sam-altman.jpg",
    fullUrl: "sam-altman-full.png",
    voiceQuality: 7.0,
    categories: ["tech"],
  }),
  Speaker.fromJson({
    name: "Sarah Palin",
    slug: "sarah-palin",
    description: "Politician",
    avatarUrl: "sarah-palin.jpg",
    fullUrl: "sarah-palin-full.png",
    voiceQuality: 5.3,
    categories: ["politics"],
  }),
  Speaker.fromJson({
    name: "Saruman",
    slug: "saruman",
    apiSlugOverride: "christopher-lee",
    description: "Lord of the Rings",
    avatarUrl: "saruman.jpg",
    fullUrl: "saruman-full.png",
    voiceQuality: 6.5,
    categories: ["fantasy"],
  }),
  Speaker.fromJson({
    name: "Scout",
    slug: "scout",
    description: "TF2",
    avatarUrl: "scout.jpg",
    fullUrl: "scout-full.png",
    voiceQuality: 4.5,
    categories: ["games"],
  }),
  Speaker.fromJson({
    name: "Severus Snape",
    slug: "severus-snape",
    apiSlugOverride: "alan-rickman",
    description: "Harry Potter",
    avatarUrl: "snape.jpg",
    fullUrl: "snape-full.png",
    voiceQuality: 6.0,
    categories: ["fantasy"],
  }),
  Speaker.fromJson({
    name: "Shohreh Aghdashloo",
    slug: "shohreh-aghdashloo",
    description: "Politician",
    avatarUrl: "shohreh-aghdashloo.jpg",
    fullUrl: "shohreh-aghdashloo-full.png",
    voiceQuality: 6.7,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Sir David Attenborough",
    slug: "david-attenborough",
    description: "Naturalist.",
    avatarUrl: "david-attenborough.jpg",
    fullUrl: "david-attenborough-full.png",
    voiceQuality: 8.0,
    categories: ["celebrities", "science"],
  }),
  Speaker.fromJson({
    name: "Snake",
    slug: "solid-snake",
    description: "Metal Gear",
    avatarUrl: "snake.png",
    fullUrl: "snake-full.png",
    voiceQuality: 5.5,
    categories: ["games"],
  }),
  Speaker.fromJson({
    name: "Sonic",
    slug: "sonic",
    description: "Gotta go fast",
    avatarUrl: "sonic.jpg",
    fullUrl: "sonic-full.png",
    voiceQuality: 8.5,
    categories: ["games"],
    defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "SpongeBob SquarePants",
    slug: "spongebob-squarepants",
    description: "Lives in a sponge under the sea.",
    avatarUrl: "spongebob-squarepants.jpg",
    fullUrl: "spongebob-squarepants-full.png",
    voiceQuality: 8.0,
    categories: ["cartoons"],
    defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "Squidward Tentacles",
    slug: "squidward",
    description: "SpongeBob SquarePants",
    avatarUrl: "squidward.jpg",
    fullUrl: "squidward-full.png",
    voiceQuality: 4.5,
    categories: ["cartoons"],
  }),
  Speaker.fromJson({
    name: "Tommy Wiseau",
    slug: "tommy-wiseau",
    description: "The Room.",
    avatarUrl: "tommy-wiseau-laugh.webp",
    fullUrl: "tommy-wiseau-full.png",
    voiceQuality: 4.6,
    categories: ["celebrities", "meme"],
  }),
  Speaker.fromJson({
    name: "Trevor Philips",
    slug: "trevor-philips",
    description: "GTAV",
    avatarUrl: "trevor-philips.jpg",
    fullUrl: "trevor-philips-full.png",
    voiceQuality: 5.5,
    categories: ["games"],
  }),
  Speaker.fromJson({
    name: "Tucker Carlson",
    slug: "tucker-carlson",
    description: "TV news personality",
    avatarUrl: "tucker-carlson.jpg",
    fullUrl: "tucker-carlson-full.png",
    voiceQuality: 7.5,
    categories: ["politics", "news"],
  }),
  Speaker.fromJson({
    name: "Tupac Shakur (acapella lyrics)",
    slug: "tupac-shakur",
    description: "Musician.",
    avatarUrl: "tupac-shakur.jpg",
    fullUrl: "tupac-shakur-full.png",
    voiceQuality: 5.0,
    categories: ["musicians"],
  }),
  Speaker.fromJson({
    name: "Vegeta",
    slug: "vegeta",
    description: "It's over 9000.",
    avatarUrl: "vegeta-9000.webp",
    fullUrl: "vegeta-full.png",
    voiceQuality: 5.5,
    categories: ["cartoons"],
  }),
  Speaker.fromJson({
    name: "Wilford Brimley",
    slug: "wilford-brimley",
    description: "Actor",
    avatarUrl: "wilford-brimley.jpg",
    fullUrl: "wilford-brimley-full.png",
    voiceQuality: 7.4,
    categories: ["celebrities"],
  }),
  Speaker.fromJson({
    name: "Wizard (Death Battle!)",
    slug: "wizard",
    description: "Rooster Teeth YouTube Show",
    avatarUrl: "wizard.jpg",
    fullUrl: "wizard-full.png",
    voiceQuality: 5.4,
    categories: ["streamers"],
  }),
  Speaker.fromJson({
    name: "Yami Yugi",
    slug: "yami-yugi",
    description: "You've activated my trap card.",
    avatarUrl: "yami-yugi.jpg",
    fullUrl: "yami-yugi-full.png",
    voiceQuality: 7.2,
    categories: ["cartoons"],
    //defaultVoice: true,
  }),
  Speaker.fromJson({
    name: "Yoda",
    slug: "yoda",
    description: "reverse grammar it is",
    avatarUrl: "yoda.webp",
    fullUrl: "yoda-full.webp",
    voiceQuality: 7.2,
    categories: ["cartoons", "fantasy", "new"],
    defaultVoice: true,
  }),
];

const SPEAKERS_BY_CATEGORY : Map<SpeakerCategory, Array<Speaker>> = new Map();

SPEAKER_CATEGORIES.forEach(category => {
  SPEAKERS_BY_CATEGORY.set(category, []);
});

SPEAKERS.forEach(speaker => {
  speaker.getCategories().forEach((category: SpeakerCategory) => {
    let categoryList = SPEAKERS_BY_CATEGORY.get(category);
    if (categoryList === undefined) {
      throw new Error(`No such category: ${category.getName()}`);
    }
    categoryList.push(speaker);
  });
});

export {
  Speaker,
  SpeakerCategory,
  SPEAKERS,
  SPEAKER_CATEGORIES,
  SPEAKERS_BY_CATEGORY,
  CATEGORY_ALL,
};
