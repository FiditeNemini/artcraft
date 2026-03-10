import { create } from "zustand";

export interface GeneratedAngle {
  id: string;
  imageUrl: string;
  rotation: number;
  tilt: number;
  zoom: number;
  timestamp: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface AngleConfig {
  rotation: number; // 0, 45, 90, 135, 180, 225, 270, 315
  tilt: number; // -30, 0, 30, 60
  zoom: number; // 0, 5, 10
}

// Snapped value options
export const ROTATION_VALUES = [0, 45, 90, 135, 180, 225, 270, 315];
export const TILT_VALUES = [-30, 0, 30, 60];
export const ZOOM_VALUES = [0, 5, 10];

interface AnglesState {
  // Source image
  sourceImageUrl: string | null;
  sourceMediaToken: string | null;
  imageDimensions: ImageDimensions | null;

  // Angle config
  angleConfig: AngleConfig;
  generateFromBestAngles: boolean;

  // Generated results
  generatedAngles: GeneratedAngle[];
  activeAngleId: string | null;

  // Processing
  isProcessing: boolean;
  pendingSubscriberId: string | null;
  isLoadingImage: boolean;

  // Actions
  setSourceImage: (url: string, mediaToken: string | null) => void;
  setImageDimensions: (dims: ImageDimensions | null) => void;
  setRotation: (value: number) => void;
  setTilt: (value: number) => void;
  setZoom: (value: number) => void;
  setGenerateFromBestAngles: (value: boolean) => void;
  addGeneratedAngle: (angle: GeneratedAngle) => void;
  setActiveAngle: (id: string | null) => void;
  getActiveAngle: () => GeneratedAngle | null;
  setIsProcessing: (value: boolean) => void;
  setIsLoadingImage: (value: boolean) => void;
  startGeneration: (subscriberId: string) => void;
  completeGeneration: (
    subscriberId: string,
    images: Array<{ cdn_url: string; media_token: string }>,
  ) => void;
  resetSource: () => void;
  clearAll: () => void;
}

const DEFAULT_CONFIG: AngleConfig = {
  rotation: 0,
  tilt: 0,
  zoom: 0,
};

export const useAnglesStore = create<AnglesState>((set, get) => ({
  sourceImageUrl: null,
  sourceMediaToken: null,
  imageDimensions: null,
  angleConfig: { ...DEFAULT_CONFIG },
  generateFromBestAngles: false,
  generatedAngles: [],
  activeAngleId: null,
  isProcessing: false,
  pendingSubscriberId: null,
  isLoadingImage: false,

  setSourceImage: (url, mediaToken) => {
    set({ sourceImageUrl: url, sourceMediaToken: mediaToken });
  },

  setImageDimensions: (dims) => {
    set({ imageDimensions: dims });
  },

  setRotation: (value) => {
    set((state) => ({
      angleConfig: { ...state.angleConfig, rotation: value },
    }));
  },

  setTilt: (value) => {
    set((state) => ({
      angleConfig: { ...state.angleConfig, tilt: value },
    }));
  },

  setZoom: (value) => {
    set((state) => ({
      angleConfig: { ...state.angleConfig, zoom: value },
    }));
  },

  setGenerateFromBestAngles: (value) => {
    set({ generateFromBestAngles: value });
  },

  addGeneratedAngle: (angle) => {
    set((state) => ({
      generatedAngles: [...state.generatedAngles, angle],
      activeAngleId: angle.id,
    }));
  },

  setActiveAngle: (id) => {
    set({ activeAngleId: id });
  },

  getActiveAngle: () => {
    const state = get();
    return (
      state.generatedAngles.find((a) => a.id === state.activeAngleId) ?? null
    );
  },

  setIsProcessing: (value) => {
    set({ isProcessing: value });
  },

  setIsLoadingImage: (value) => {
    set({ isLoadingImage: value });
  },

  startGeneration: (subscriberId) => {
    set({ isProcessing: true, pendingSubscriberId: subscriberId });
  },

  completeGeneration: (subscriberId, images) => {
    const state = get();
    if (state.pendingSubscriberId !== subscriberId) return;

    const newAngles: GeneratedAngle[] = images.map((img) => ({
      id: img.media_token,
      imageUrl: img.cdn_url,
      rotation: state.angleConfig.rotation,
      tilt: state.angleConfig.tilt,
      zoom: state.angleConfig.zoom,
      timestamp: Date.now(),
    }));

    set((s) => ({
      generatedAngles: [...s.generatedAngles, ...newAngles],
      activeAngleId: newAngles[0]?.id ?? s.activeAngleId,
      isProcessing: false,
      pendingSubscriberId: null,
    }));
  },

  resetSource: () => {
    set({
      sourceImageUrl: null,
      sourceMediaToken: null,
      imageDimensions: null,
      angleConfig: { ...DEFAULT_CONFIG },
      generateFromBestAngles: false,
      isProcessing: false,
      pendingSubscriberId: null,
      isLoadingImage: false,
    });
  },

  clearAll: () => {
    set({
      sourceImageUrl: null,
      sourceMediaToken: null,
      imageDimensions: null,
      angleConfig: { ...DEFAULT_CONFIG },
      generateFromBestAngles: false,
      generatedAngles: [],
      activeAngleId: null,
      isProcessing: false,
      pendingSubscriberId: null,
      isLoadingImage: false,
    });
  },
}));
