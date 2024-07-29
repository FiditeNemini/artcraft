
export enum TwitchEventCategory {
  Bits = "bits",
  ChannelPoints = "channel_points",
  ChatCommand = "chat_command",
};

export const TWITCH_EVENT_CATEGORY_BY_STRING = new Map<string, TwitchEventCategory>([
  ["bits", TwitchEventCategory.Bits],
  ["channel_points", TwitchEventCategory.ChannelPoints],
]);

