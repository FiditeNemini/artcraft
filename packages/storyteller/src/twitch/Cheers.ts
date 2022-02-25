
export enum TwitchCheerPrefix {
    Cheer = "Cheer",
    DoodleCheer = "DoodleCheer",
    BibleThump = "BibleThump",
    Cheerwhal = "cheerwhal",
    Corgo = "Corgo",
    Uni = "uni",
    ShowLove = "ShowLove",
    Party = "Party",
    SeemsGood = "SeemsGood",
    Pride = "Pride",
    Kappa = "Kappa",
    FrankerZ = "FrankerZ",
    HeyGuys = "HeyGuys",
    DansGame = "DansGame",
    EleGiggle = "EleGiggle",
    TriHard = "TriHard",
    Kreygasm = "Kreygasm",
    FourHead = "4Head",
    SwiftRage = "SwiftRage",
    NotLikeThis = "NotLikeThis",
    FailFish = "FailFish",
    VoHiYo = "VoHiYo",
    PjSalt = "PJSalt",
    MrDestructoid = "MrDestructoid",
    BDay = "bday",
    RipChear = "RIPCheer",
    Shamrock = "Shamrock",
    BitBoss = "BitBoss",
    Streamlabs = "Streamlabs",
    Muxy = "Muxy",
    HolidayCheer = "HolidayCheer",
}

// TODO: Immutability
/// This list seems pretty comprehensive
/// https://github.com/nossebro/TwitchPubSubMirror/blob/master/TwitchPubSubMirror_StreamlabsSystem.py
export const CHEER_PREFIXES : string[] = [
    "Cheer",
    "DoodleCheer",
    "BibleThump",
    "cheerwhal",
    "Corgo",
    "uni",
    "ShowLove",
    "Party",
    "SeemsGood",
    "Pride",
    "Kappa",
    "FrankerZ",
    "HeyGuys",
    "DansGame",
    "EleGiggle",
    "TriHard",
    "Kreygasm",
    "4Head",
    "SwiftRage",
    "NotLikeThis",
    "FailFish",
    "VoHiYo",
    "PJSalt",
    "MrDestructoid",
    "bday",
    "RIPCheer",
    "Shamrock",
    "BitBoss",
    "Streamlabs",
    "Muxy",
    "HolidayCheer"
];

// TODO: Immutability
export const CHEER_LOOKUP_MAP : Map<string, TwitchCheerPrefix> = new Map([
    ["Cheer", TwitchCheerPrefix.Cheer],
    ["DoodleCheer", TwitchCheerPrefix.DoodleCheer],
    ["BibleThump", TwitchCheerPrefix.BibleThump],
    ["cheerwhal", TwitchCheerPrefix.Cheerwhal],
    ["Corgo", TwitchCheerPrefix.Corgo],
    ["uni", TwitchCheerPrefix.Uni],
    ["ShowLove", TwitchCheerPrefix.ShowLove],
    ["Party", TwitchCheerPrefix.Party],
    ["SeemsGood", TwitchCheerPrefix.SeemsGood],
    ["Pride", TwitchCheerPrefix.Pride],
    ["Kappa", TwitchCheerPrefix.Kappa],
    ["FrankerZ", TwitchCheerPrefix.FrankerZ],
    ["HeyGuys", TwitchCheerPrefix.HeyGuys],
    ["DansGame", TwitchCheerPrefix.DansGame],
    ["EleGiggle", TwitchCheerPrefix.EleGiggle],
    ["TriHard", TwitchCheerPrefix.TriHard],
    ["Kreygasm", TwitchCheerPrefix.Kreygasm],
    ["4Head", TwitchCheerPrefix.FourHead],
    ["SwiftRage", TwitchCheerPrefix.SwiftRage],
    ["NotLikeThis", TwitchCheerPrefix.NotLikeThis],
    ["FailFish", TwitchCheerPrefix.NotLikeThis],
    ["VoHiYo", TwitchCheerPrefix.VoHiYo],
    ["PJSalt", TwitchCheerPrefix.PjSalt],
    ["MrDestructoid", TwitchCheerPrefix.MrDestructoid],
    ["bday", TwitchCheerPrefix.BDay],
    ["RIPCheer", TwitchCheerPrefix.BDay],
    ["Shamrock", TwitchCheerPrefix.Shamrock],
    ["BitBoss", TwitchCheerPrefix.BitBoss],
    ["Streamlabs", TwitchCheerPrefix.Streamlabs],
    ["Muxy", TwitchCheerPrefix.Muxy],
    ["HolidayCheer", TwitchCheerPrefix.HolidayCheer],
]);

// TODO: Immutability
export const CHEER_PREFIX_TO_STRING_MAP : Map<TwitchCheerPrefix, string> = new Map(
    Array.from(CHEER_LOOKUP_MAP, entry => [entry[1], entry[0]])
)

// TODO: Immutability
/// Levels of cheering
export const CHEER_BIT_LEVELS = [1, 100, 1000, 5000, 10000];
