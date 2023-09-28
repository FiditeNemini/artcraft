import { create } from "zustand";

interface UploadedFilesState {
  files: any[];
  audioLinks: string[];
}

const useUploadedFiles = create<UploadedFilesState>((set) => ({
  files: [],
  setFiles: (files: any[]) => set({ files }),
  audioLinks: [],
  setAudioLinks: (audioLinks: string[]) => set({ audioLinks }),
}));

export default useUploadedFiles;
