import { create } from "zustand";

interface VoiceDetailsState {
  name: string;
  vocalType: any;
  tags: any;
  description: string;
  visibility: any;
  setName: (name: string) => void;
  setVocalType: (vocalType: any) => void;
  setTags: (tags: any) => void;
  setDescription: (description: string) => void;
  setVisibility: (visibility: any) => void;
}

export const useVoiceDetailsStore = create<VoiceDetailsState>((set) => ({
  name: "",
  vocalType: null,
  tags: null,
  description: "",
  visibility: null,
  setName: (name) => set({ name }),
  setVocalType: (vocalType) => set({ vocalType }),
  setTags: (tags) => set({ tags }),
  setDescription: (description) => set({ description }),
  setVisibility: (visibility) => set({ visibility }),
}));

export default useVoiceDetailsStore;
