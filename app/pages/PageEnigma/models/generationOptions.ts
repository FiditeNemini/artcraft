export interface GenerationOptions {
  upscale: boolean;
  faceDetail: boolean;
  styleStrength: number;
  lipSync: boolean;
  cinematic: boolean;
}

export class GenerationOptions {
  public upscale: boolean;
  public faceDetail: boolean;
  public styleStrength: number;
  public lipSync: boolean;
  public cinematic: boolean;

  constructor(
    upscale: boolean,
    faceDetail: boolean,
    styleStrength: number,
    lipSync: boolean,
    cinematic: boolean,
  ) {
    this.upscale = upscale;
    this.faceDetail = faceDetail;
    this.styleStrength = styleStrength;
    this.lipSync = lipSync;
    this.cinematic = cinematic;
  }
}
