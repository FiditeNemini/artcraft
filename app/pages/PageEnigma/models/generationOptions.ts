export interface GenerationOptions {
  upscale: boolean;
  faceDetail: boolean;
  styleStrength: number;
  lipSync: boolean;
  cinematic: boolean;
  globalIpAdapterImageMediaToken: string; // base 64 image
}

export class GenerationOptions {
  public upscale: boolean;
  public faceDetail: boolean;
  public styleStrength: number;
  public lipSync: boolean;
  public cinematic: boolean;
  public globalIpAdapterImageMediaToken: string;
  constructor(
    upscale: boolean,
    faceDetail: boolean,
    styleStrength: number,
    lipSync: boolean,
    cinematic: boolean,
    globalIpAdapterImageMediaToken: string,
  ) {
    this.upscale = upscale;
    this.faceDetail = faceDetail;
    this.styleStrength = styleStrength;
    this.lipSync = lipSync;
    this.cinematic = cinematic;
    this.globalIpAdapterImageMediaToken = globalIpAdapterImageMediaToken;
  }
}
