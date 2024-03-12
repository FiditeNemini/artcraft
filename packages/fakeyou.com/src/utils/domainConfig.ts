export enum Website {
  FakeYou,
  StorytellerAi,
}

export interface DomainConfig {
  website: Website;
  logo: string;
  title: string;
  link: string;
}

const domainConfigs: Record<string, DomainConfig> = {
  fakeyou: {
    website: Website.StorytellerAi,
    logo: "/fakeyou/Storyteller-Logo-1.png",
    title: "Storyteller AI",
    link: "https://storyteller.ai",
  },
  storyteller: {
    website: Website.FakeYou,
    logo: "/fakeyou/FakeYou-Logo-2.png",
    title: "FakeYou",
    link: "https://fakeyou.com",
  },
};

export const getCurrentDomainConfig = (): DomainConfig => {
  // Fast resolve without leaking domain details
  switch (window.location.hostname) {
    case "fakeyou.com":
      return domainConfigs.fakeyou;
    case "storyteller.ai":
      return domainConfigs.storyteller;
  }

  if (window.location.hostname.includes("storyteller")) {
    return domainConfigs.storyteller;
  }

  // Default fallback
  return domainConfigs.fakeyou;
};
