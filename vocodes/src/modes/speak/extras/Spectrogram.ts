
class Spectrogram {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(pixels: Uint8ClampedArray, width: number, height: number) {
    this.pixels = pixels;
    this.width = width;
    this.height = height;
  }
}

export { Spectrogram };
