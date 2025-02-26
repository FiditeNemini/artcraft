// Server communication types
export interface ModelConfig {
  name: string;
  path: string;
  precision: "fp16" | "fp32";
}

export interface LoraConfig {
  path: string;
  alpha: number;
}

export interface ServerSetupPayload {
  type: "setup";
  model: ModelConfig;
  lora?: LoraConfig;
  device: "cuda" | "cpu";
}

export interface ServerSettingsPayload {
  type: "settings";
  prompt?: string;
  strength?: number;
  steps?: number;
  guidance_scale?: number;
  seed?: number;
  negative_prompt?: string;
}

export interface ServerResponse {
  type: "progress" | "success" | "error";
  status?: "model_loaded" | "generation_complete";
  message?: string;
  percent?: number;
  image?: string; // base64 encoded image
}
