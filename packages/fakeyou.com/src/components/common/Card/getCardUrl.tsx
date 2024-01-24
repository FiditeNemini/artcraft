const getCardUrl = (data: any, source: string, type: string) => {
  let prefix = type === "media" ? `/media/${data.token}` : `/weight/${data.weight_token || data.details?.entity_token}`;
  let suffix = source ? "?source=" + source : "";
  return prefix + suffix;
}

export default getCardUrl;