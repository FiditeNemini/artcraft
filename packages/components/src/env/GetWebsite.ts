export enum Website {
  FakeYou,
  StorytellerAi,
}

export interface WebsiteConfig {
  // Which website we're on
  website: Website;

  // Rooted link to the logo.
  logo: string;

  // When the title needs a suffix or prefix, use this.
  titlePart: string;

  // Link to the website.
  link: string;
}

const websiteConfigs: Record<string, WebsiteConfig> = {
  storyteller: {
    website: Website.StorytellerAi,
    logo: "/fakeyou/Storyteller-Logo-1.png",
    titlePart: "Storyteller AI",
    link: "https://storyteller.ai",
  },
  fakeyou: {
    website: Website.FakeYou,
    logo: "/fakeyou/FakeYou-Logo-2.png",
    titlePart: "FakeYou",
    link: "https://fakeyou.com",
  },
};

const determineWebsite = (): WebsiteConfig => {
  // Fast resolve without leaking domain details
  switch (window.location.hostname) {
    case "fakeyou.com":
      return websiteConfigs.fakeyou;
    case "storyteller.ai":
      return websiteConfigs.storyteller;
  }

  if (window.location.hostname.includes("storyteller")) {
    return websiteConfigs.storyteller;
  } else {
    // Default fallback
    return websiteConfigs.fakeyou;
  }
};

const CURRENT_WEBSITE : WebsiteConfig = determineWebsite();

export const GetWebsite = (): WebsiteConfig => {
  return CURRENT_WEBSITE;
};
