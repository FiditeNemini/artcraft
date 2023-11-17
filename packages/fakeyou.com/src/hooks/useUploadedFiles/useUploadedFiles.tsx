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
  deleteEverything:() => set({ files: [], audioLinks: [] }),
}));

export default useUploadedFiles;
