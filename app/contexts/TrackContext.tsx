import { createContext } from "react";
import { CharacterTrack } from "~/models/track";

export const TrackContext = createContext<{
  characters: CharacterTrack[];
  updateCharacters: (options: {
    type: "animations" | "positions" | "lipSync";
    id: string;
    length: number;
    offset: number;
  }) => void;
  selectClip: (options: {
    type: "animations" | "positions" | "lipSync";
    id: string;
  }) => void;
}>({
  characters: [],
  updateCharacters: () => {},
  selectClip: () => {},
});
