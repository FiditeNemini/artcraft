import { ColorMap, createColorMap, linearScale, RGBColor } from "@colormap/core";
import { SpectrogramMode } from "../../../OldVocodesContainer";
import { VIRIDIS, INFERNO, MAGMA, BLACK_WHITE, CIVIDIS, PLASMA,  } from "@colormap/presets";
import { BONE } from "../../../extra_colormaps/colormap-bone";
import { COPPER } from "../../../extra_colormaps/colormap-copper";
import { JET } from "../../../extra_colormaps/colormap-jet";
import { RDBU } from "../../../extra_colormaps/colormap-rdbu";
import { RDGY } from "../../../extra_colormaps/colormap-rdgy";
import { GIST_HEAT } from "../../../extra_colormaps/colormap-gist_heat";
import { PINK } from "../../../extra_colormaps/colormap-pink";
import { AFMHOT } from "../../../extra_colormaps/colormap-afmhot";
import { COOL } from "../../../extra_colormaps/colormap-cool";
import { SPRING } from "../../../extra_colormaps/colormap-spring";

class Spectrogram {
  base64bytes: string;
  pixels: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(base64bytes: string, pixels: Uint8ClampedArray, width: number, height: number) {
    this.base64bytes = base64bytes;
    this.pixels = pixels;
    this.width = width;
    this.height = height;
  }

  calculatePixelsForMode(spectrogramMode: SpectrogramMode) : Uint8ClampedArray {
    let scale = linearScale([0, 255], [0, 1]);

    let colors = this.spectrogramModeToColors(spectrogramMode);
    let colorMap = createColorMap(colors, scale);

    return base64ToArrayBuffer(this.base64bytes, colorMap);
  }

  spectrogramModeToColors(spectrogramMode: SpectrogramMode) : RGBColor[] {
    switch (spectrogramMode) {
      case SpectrogramMode.VIRIDIS:
        return VIRIDIS;
      case SpectrogramMode.CIVIDIS:
        return CIVIDIS;
      case SpectrogramMode.PLASMA:
        return PLASMA;
      case SpectrogramMode.INFERNO:
        return INFERNO;
      case SpectrogramMode.MAGMA:
        return MAGMA;
      case SpectrogramMode.BLACK_WHITE:
        return BLACK_WHITE;
      case SpectrogramMode.BONE:
        return BONE;
      case SpectrogramMode.COPPER:
        return COPPER;
      case SpectrogramMode.JET:
        return JET;
      case SpectrogramMode.RDBU:
        return RDBU;
      case SpectrogramMode.RDGY:
        return RDGY;
      case SpectrogramMode.GIST_HEAT:
        return GIST_HEAT
      case SpectrogramMode.PINK:
        return PINK
      case SpectrogramMode.AFMHOT:
        return AFMHOT
      case SpectrogramMode.COOL:
        return COOL 
      case SpectrogramMode.SPRING:
        return SPRING
    }
  }
}

function nextSpectrogramMode(spectrogramMode: SpectrogramMode) : SpectrogramMode {
  const index = Number(spectrogramMode);
  const keys = Object.keys(SpectrogramMode).filter(k => typeof SpectrogramMode[k as any] === "number");
  const length = keys.length;
  let next = (index + 1) % length;
  return next as SpectrogramMode;
}

// https://stackoverflow.com/a/21797381
function base64ToArrayBuffer(base64string: string, colorMap: ColorMap) : Uint8ClampedArray {
  var binary_string = window.atob(base64string);
  var len = binary_string.length * 4;
  let bytes = new Uint8ClampedArray(len);
  for (let i = 0, j = 0; i < len; i++, j += 4) {
    let val = binary_string.charCodeAt(i);
    if (isNaN(val)) {
      val = 0;
    }
    let mapped = colorMap(val);
    let r = Math.floor(mapped[0] * 255)
    let g = Math.floor(mapped[1] * 255)
    let b = Math.floor(mapped[2] * 255)
    bytes[j+0] = r;
    bytes[j+1] = g;
    bytes[j+2] = b;
    bytes[j+3] = 255;
  }
  return bytes;
}

export { Spectrogram, nextSpectrogramMode };
