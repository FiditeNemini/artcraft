export interface GenerationOptions {
  upscale: boolean;
  faceDetail: boolean;
  styleStrength: number;
  lipSync: boolean;
  cinematic: boolean;
  globalIpAdapterImageMediaToken: string | null;
}

export class GenerationOptions {
  public upscale: boolean;
  public faceDetail: boolean;
  public styleStrength: number;
  public lipSync: boolean;
  public cinematic: boolean;
  public globalIpAdapterImageMediaToken: string | null;
  constructor(
    upscale: boolean,
    faceDetail: boolean,
    styleStrength: number,
    lipSync: boolean,
    cinematic: boolean,
    globalIpAdapterImageMediaToken: string | null,
  ) {
    this.upscale = upscale;
    this.faceDetail = faceDetail;
    this.styleStrength = styleStrength;
    this.lipSync = lipSync;
    this.cinematic = cinematic;
    this.globalIpAdapterImageMediaToken = globalIpAdapterImageMediaToken;
  }
}
