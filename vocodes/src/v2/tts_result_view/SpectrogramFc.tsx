import React, { useEffect, useRef, useState }  from 'react';

interface Props {
  spectrogramJsonLink: string  
}

interface SpectrogramResponse {
  mel: Array<Array<number>>,
  mel_postnet: Array<Array<number>>,
  mel_for_scaling: Array<Array<number>>,
}

function SpectrogramFc(props: Props) {

  const canvasRef = useRef(null);

  let linearizeImage = (image: Array<Array<number>>) : Uint8ClampedArray => {
    let width = image.length;
    let height = image[0].length;
    let size = width * height * 4;

    let bytes = new Uint8ClampedArray(size);

    let k = 0;

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        let value = image[i][j];

        bytes[k] = value;
        bytes[k+1] = value;
        bytes[k+2] = value;
        bytes[k+3] = 255;

        k += 4;
      }
    }

    return bytes;
  }

  useEffect(() => {
    //const api = new ApiConfig();
    //const endpointUrl = api.viewTtsInferenceResult(token);

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

  //onClick={() => this.props.changeSpectrogramMode(nextMode)}
  let canvas = <canvas 
    ref={canvasRef} 
    width={width}
    height={height}
    id="spectrogram"
    />

  return (
    <div>
      {canvas}
      <p>(Click or tap to change spectrogram theme.)</p>
    </div>
  )
}

export { SpectrogramFc };
