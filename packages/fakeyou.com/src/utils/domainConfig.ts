type DomainConfig = Record<string, any>;

const domainConfigs: Record<string, DomainConfig> = {
  "storyteller.ai": {
    logo: "/fakeyou/Storyteller-Logo-2.png",
    title: "Storyteller AI",
    link: "https://storyteller.ai",
  },
  "fakeyou.com": {
    logo: "/fakeyou/FakeYou-Logo-2.png",
    title: "FakeYou",
    link: "https://fakeyou.com",
  },
  // Default to FakeYou.com
  default: {
    logo: "/fakeyou/FakeYou-Logo-2.png",
    title: "FakeYou",
    link: "https://fakeyou.com",
  },
};

export const getCurrentDomainConfig = (): DomainConfig => {
  const currentHostname = window.location.hostname;

  const matchingConfigKey = Object.keys(domainConfigs).find(
    key => currentHostname === key || currentHostname.endsWith(`.${key}`)
  );

  const domainConfig =
    matchingConfigKey !== undefined
      ? domainConfigs[matchingConfigKey]
      : domainConfigs["default"];

  return domainConfig;
};
