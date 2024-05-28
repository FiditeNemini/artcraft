export interface GenerationOptions {
  upscale: boolean;
  faceDetail: boolean;
  styleStrength: number;
  lipSync: boolean;
}

export class GenerationOptions {
  public upscale: boolean;
  public faceDetail: boolean;
  public styleStrength: number;
  public lipSync: boolean;

  constructor(
    upscale: boolean,
    faceDetail: boolean,
    styleStrength: number,
    lipSync: boolean,
  ) {
    this.upscale = upscale;
    this.faceDetail = faceDetail;
    this.styleStrength = styleStrength;
    this.lipSync = lipSync;
  }
}
