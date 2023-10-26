const GetApiHost = () => {
  switch (document.location.host.split(":")[0]) { // strip ports
    case "fakeyou.com":
    case "staging.fakeyou.com":
      return ["api.fakeyou.com"];
    case "storyteller.ai":
    case "staging.storyteller.ai":
      return ["api.storyteller.ai"];
    case "storyteller.stream": // Storyteller.stream is deprecated and will be decommissioned in the future.
      return ["api.storyteller.stream"];
    case "devproxy.fakeyou.com":
      return ["api.fakeyou.com"];
    case "devproxy.storyteller.ai":
      return ["api.storyteller.ai"];
    case "dev.fakeyou.com":
      return ["api.dev.fakeyou.com"]; // NB: for dev machines with nginx proxies
    case "dev.fakeyou.com":
      return ["api.dev.fakeyou.com:12345",true]; // true = disableSSL
    default:
      return document.location.host.includes("localhost") ? 
        ["localhost:12345",document.location.protocol !== "https:"] :
        ["api.fakeyou.com"]; // default
  }
};

export default GetApiHost;