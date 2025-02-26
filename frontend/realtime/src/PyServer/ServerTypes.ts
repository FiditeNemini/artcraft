// Server Message Types - Common base type for all messages
export type MessageType =
  | "setup"
  | "setup_response"
  | "update_settings"
  | "update_settings_response"
  | "generate"
  | "generate_response"
  | "status"
  | "status_response"
  | "progress_update"
  | "error"
  | "connection_error";

// Base interface for all messages
interface BaseMessage {
  type: MessageType;
}

// ===== Setup Messages =====

// Setup Request
export interface SetupRequest extends BaseMessage {
  type: "setup";
  setup: {
    sdxl_checkpoint_path: string;
    lora_path?: string;
  };
}

// Setup Response
export interface SetupResponse extends BaseMessage {
  type: "setup_response";
  success: boolean;
  message?: string;
  error?: string;
  settings?: ServerSettings;
}

// ===== Update Settings Messages =====

// Default generation settings that can be configured
export interface GenerationSettings {
  default_lora_strength?: number;
  default_image_to_image_strength?: number;
  default_width?: number;
  default_height?: number;
  default_steps?: number;
  default_guidance_scale?: number;
}

// Server settings - includes both paths and generation defaults
export interface ServerSettings extends GenerationSettings {
  sdxl_checkpoint_path: string;
  lora_path?: string | null;
}

// Update Settings Request
export interface UpdateSettingsRequest extends BaseMessage {
  type: "update_settings";
  settings: Partial<ServerSettings>;
}

// Update Settings Response
export interface UpdateSettingsResponse extends BaseMessage {
  type: "update_settings_response";
  success: boolean;
  message?: string;
  error?: string;
  updates_applied?: string[];
  current_settings: ServerSettings;
}

// ===== Generate Messages =====

// Generation parameters
export interface GenerationParameters {
  image: string; // base64 encoded image
  prompt: string;
  lora_strength?: number;
  image_to_image_strength?: number;
  generated_image_width?: number;
  generated_image_height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

// Generate Request
export interface GenerateRequest extends BaseMessage {
  type: "generate";
  generate: GenerationParameters;
}

// Generate Response
export interface GenerateResponse extends BaseMessage {
  type: "generate_response";
  success: boolean;
  image?: string; // base64 encoded image
  error?: string;
}

// ===== Status Messages =====

// Status Request
export interface StatusRequest extends BaseMessage {
  type: "status";
}

// Status Response
export interface StatusResponse extends BaseMessage {
  type: "status_response";
  success: boolean;
  model_initialized: boolean;
  current_settings: ServerSettings;
}

// ===== Progress Update =====

// Progress stages
export type ProgressStage =
  | "downloading"
  | "loading_unet"
  | "loading_base_model"
  | "configuring_scheduler"
  | "loading_lcm_adapter"
  | "loading_lora"
  | "generating"
  | "error";

// Progress Update Message
export interface ProgressUpdateMessage extends BaseMessage {
  type: "progress_update";
  stage: ProgressStage;
  progress: number; // 0-100
  file: string;
}

// ===== Error Messages =====

// Error Message
export interface ErrorMessage extends BaseMessage {
  type: "error";
  error: string;
}

// Connection Error Message
export interface ConnectionErrorMessage extends BaseMessage {
  type: "connection_error";
  error: string;
}

// Union type for all possible server messages
export type ServerMessage =
  | SetupRequest
  | SetupResponse
  | UpdateSettingsRequest
  | UpdateSettingsResponse
  | GenerateRequest
  | GenerateResponse
  | StatusRequest
  | StatusResponse
  | ProgressUpdateMessage
  | ErrorMessage
  | ConnectionErrorMessage;

// WebSocket event handlers for different message types
export interface WebSocketHandlers {
  onSetupResponse?: (response: SetupResponse) => void;
  onUpdateSettingsResponse?: (response: UpdateSettingsResponse) => void;
  onGenerateResponse?: (response: GenerateResponse) => void;
  onStatusResponse?: (response: StatusResponse) => void;
  onProgressUpdate?: (update: ProgressUpdateMessage) => void;
  onError?: (error: ErrorMessage | ConnectionErrorMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

// Helper function to create a typed setup request
export function createSetupRequest(
  sdxl_checkpoint_path: string,
  lora_path?: string,
): SetupRequest {
  return {
    type: "setup",
    setup: {
      sdxl_checkpoint_path,
      lora_path,
    },
  };
}

// Helper function to create a typed update settings request
export function createUpdateSettingsRequest(
  settings: Partial<ServerSettings>,
): UpdateSettingsRequest {
  return {
    type: "update_settings",
    settings,
  };
}

// Helper function to create a typed generate request
export function createGenerateRequest(
  params: GenerationParameters,
): GenerateRequest {
  return {
    type: "generate",
    generate: params,
  };
}

// Helper function to create a typed status request
export function createStatusRequest(): StatusRequest {
  return { type: "status" };
}
