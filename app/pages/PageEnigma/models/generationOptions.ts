export interface GenerationOptions {
    upscale: boolean;
    faceDetail: boolean;
    styleStrength: number;
}

export class GenerationOptions {
    public upscale: boolean;
    public faceDetail: boolean;
    public styleStrength: number;
  
    constructor(upscale: boolean, faceDetail: boolean, styleStrength: number) {
      this.upscale = upscale;
      this.faceDetail = faceDetail;
      this.styleStrength = styleStrength;
    }
}