import React, { useEffect, useRef }  from 'react';
import { VIRIDIS, MAGMA } from "@colormap/presets";
import { createColorMap, linearScale } from "@colormap/core";
import { getRandomArrayValue } from "../../Utils";

interface Props {
  spectrogramJsonLink: string  
}

interface SpectrogramResponse {
  mel: Array<Array<number>>,
  mel_postnet: Array<Array<number>>,
  mel_for_scaling: Array<Array<number>>,
}

const COLOR_MAP_PRESETS = [
  VIRIDIS, 
  MAGMA,
];

function SpectrogramFc(props: Props) {

  const canvasRef = useRef(null);

  let linearizeImage = (image: Array<Array<number>>) : Uint8ClampedArray => {
    let width = image.length;
    let height = image[0].length;
    let size = width * height * 4;

    let bytes = new Uint8ClampedArray(size);

    let colorMapScale = linearScale([0, 255], [0, 1]);
    let colorMapColors = getRandomArrayValue(COLOR_MAP_PRESETS);
    let colorMap = createColorMap(colorMapColors, colorMapScale);

    let k = 0;

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        let value = image[i][j];

        let mapped = colorMap(value);

        bytes[k] = Math.floor(mapped[0] * 255);
        bytes[k+1] = Math.floor(mapped[1] * 255);
        bytes[k+2] = Math.floor(mapped[2] * 255);
        bytes[k+3] = 255;

        k += 4;
      }
    }

    return bytes;
  }

  useEffect(() => {
    fetch(props.spectrogramJsonLink, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(res => {
      console.log('got spectrogram', res);
      let spectrograms = res as SpectrogramResponse;

      let width = spectrograms.mel_for_scaling.length;
      let height = spectrograms.mel_for_scaling[0].length;

      let pixels = linearizeImage(spectrograms.mel_for_scaling);
      var image = new ImageData(pixels, width, height);

      const canvas = canvasRef.current as any;
      const context = canvas.getContext('2d')

      createImageBitmap(image).then(renderer => {
        context.drawImage(renderer, 0, 0, width * 3, height * 3)
      });
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });


  }, []); // NB: Empty array dependency sets to run ONLY on mount

  let width = 150 * 3;
  let height = 80 * 3;

  let canvas = <canvas 
    ref={canvasRef} 
    width={width}
    height={height}
    id="spectrogram"
    />

  return (
    <div>
      {canvas}
    </div>
  )
}

export { SpectrogramFc };
