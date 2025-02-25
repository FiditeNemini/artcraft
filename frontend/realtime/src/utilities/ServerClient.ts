import {
  ServerMessage,
  WebSocketHandlers,
  SetupRequest,
  UpdateSettingsRequest,
  GenerateRequest,
  StatusRequest,
  GenerationParameters,
  ServerSettings,
  createSetupRequest,
  createUpdateSettingsRequest,
  createGenerateRequest,
  createStatusRequest,
} from "../types/ServerTypes";

/**
 * ServerClient provides a typed interface for communicating with the Python WebSocket server
 */
export class ServerClient {
  private ws: WebSocket | null = null;
  private handlers: WebSocketHandlers = {};
  private connectionPromise: Promise<void> | null = null;
  private connectionResolve: (() => void) | null = null;
  private connectionReject: ((error: Error) => void) | null = null;

  /**
   * Create a new ServerClient
   * @param url The WebSocket URL to connect to
   * @param handlers Optional event handlers for different message types
   */
  constructor(
    private url: string,
    handlers: Partial<WebSocketHandlers> = {},
  ) {
    this.handlers = { ...handlers };
  }

  /**
   * Connect to the WebSocket server
   * @returns A promise that resolves when connected
   */
  public connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectionResolve = resolve;
      this.connectionReject = reject;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          if (this.connectionResolve) {
            this.connectionResolve();
          }
          if (this.handlers.onOpen) {
            this.handlers.onOpen();
          }
        };

        this.ws.onclose = () => {
          if (this.handlers.onClose) {
            this.handlers.onClose();
          }
          this.ws = null;
          this.connectionPromise = null;
        };

        this.ws.onerror = (event) => {
          const error = new Error(`WebSocket error: ${event}`);
          if (this.connectionReject) {
            this.connectionReject(error);
          }
          if (this.handlers.onError) {
            this.handlers.onError({
              type: "error",
              error: `Connection error: ${event}`,
            });
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as ServerMessage;
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing message:", error);
            if (this.handlers.onError) {
              this.handlers.onError({
                type: "error",
                error: `Failed to parse message: ${error}`,
              });
            }
          }
        };
      } catch (error) {
        if (this.connectionReject) {
          this.connectionReject(error as Error);
        }
        this.connectionPromise = null;
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
  }

  /**
   * Send a message to the server
   * @param message The message to send
   * @returns A promise that resolves when the message is sent
   */
  private async send(message: ServerMessage): Promise<void> {
    await this.connect();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Handle an incoming message from the server
   * @param message The message received from the server
   */
  private handleMessage(message: ServerMessage): void {
    switch (message.type) {
      case "setup_response":
        if (this.handlers.onSetupResponse) {
          this.handlers.onSetupResponse(message);
        }
        break;

      case "update_settings_response":
        if (this.handlers.onUpdateSettingsResponse) {
          this.handlers.onUpdateSettingsResponse(message);
        }
        break;

      case "generate_response":
        if (this.handlers.onGenerateResponse) {
          this.handlers.onGenerateResponse(message);
        }
        break;

      case "status_response":
        if (this.handlers.onStatusResponse) {
          this.handlers.onStatusResponse(message);
        }
        break;

      case "progress_update":
        if (this.handlers.onProgressUpdate) {
          this.handlers.onProgressUpdate(message);
        }
        break;

      case "error":
      case "connection_error":
        if (this.handlers.onError) {
          this.handlers.onError(message);
        }
        break;
    }
  }

  /**
   * Set event handlers
   * @param handlers The event handlers to set
   */
  public setHandlers(handlers: Partial<WebSocketHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Send a setup request to initialize the model
   * @param sdxl_checkpoint_path Path to the SDXL checkpoint
   * @param lora_path Optional path to a LoRA file
   */
  public async setup(
    sdxl_checkpoint_path: string,
    lora_path?: string,
  ): Promise<void> {
    const request = createSetupRequest(sdxl_checkpoint_path, lora_path);
    await this.send(request);
  }

  /**
   * Send an update settings request
   * @param settings The settings to update
   */
  public async updateSettings(
    settings: Partial<ServerSettings>,
  ): Promise<void> {
    const request = createUpdateSettingsRequest(settings);
    await this.send(request);
  }

  /**
   * Send a generate request
   * @param params The generation parameters
   */
  public async generate(params: GenerationParameters): Promise<void> {
    const request = createGenerateRequest(params);
    await this.send(request);
  }

  /**
   * Send a status request
   */
  public async requestStatus(): Promise<void> {
    const request = createStatusRequest();
    await this.send(request);
  }
}

/**
 * Create a base64 string from an image
 * @param file The image file
 * @returns A promise that resolves to the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

/**
 * Create an image from a base64 string
 * @param base64 The base64 string
 * @returns The image URL
 */
export function base64ToImageUrl(base64: string): string {
  return `data:image/png;base64,${base64}`;
}
