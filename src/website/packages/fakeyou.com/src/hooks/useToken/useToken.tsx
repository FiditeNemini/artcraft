import { create } from "zustand";

interface TokenState {
  token: string | null;
  setToken: (newToken: string | null) => void;
  weightTitle?: string | null;
  setWeightTitle?: (newWeightTitle: string | null) => void;
}

const useToken = create<TokenState>(set => ({
  token: null,
  setToken: newToken => set({ token: newToken }),
  weightTitle: null,
  setWeightTitle: newWeightTitle => set({ weightTitle: newWeightTitle }),
}));

export default useToken;
