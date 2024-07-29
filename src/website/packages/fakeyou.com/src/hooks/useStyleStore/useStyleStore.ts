import { create } from "zustand";
import { STYLE_OPTIONS } from "common/StyleOptions";

const initialStyle = STYLE_OPTIONS[0];

interface StyleStore {
  currentImage: string;
  selectedStyleValue: string;
  selectedStyleLabel: string;
  setCurrentImage: (imageSrc: string) => void;
  setSelectedStyle: (value: string, label?: string, image?: string) => void;
  resetImage: () => void;
}

const useStyleStore = create<StyleStore>(set => ({
  currentImage:
    initialStyle.image || "/images/placeholders/style_placeholder.png",
  selectedStyleValue: initialStyle.value,
  selectedStyleLabel: initialStyle.label,
  setCurrentImage: (imageSrc: string) => set({ currentImage: imageSrc }),
  setSelectedStyle: (value: string, label?: string, image?: string) =>
    set({
      selectedStyleValue: value,
      selectedStyleLabel: label,
      currentImage: image,
    }),
  resetImage: () =>
    set({ currentImage: "/images/placeholders/style_placeholder.png" }),
}));

export default useStyleStore;
