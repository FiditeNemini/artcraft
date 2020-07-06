import React from 'react';
import { Spectrogram, nextSpectrogramMode } from './Spectrogram';
import { SpectrogramMode } from '../../../App';

interface Props {
  currentSpectrogram?: Spectrogram,
  spectrogramMode: SpectrogramMode,
  changeSpectrogramMode: (spectrogramMode: SpectrogramMode) => void,
}

interface State {
}

/*
* Safari and Edge polyfill for createImageBitmap
* https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap
*
* Support source image types Blob and ImageData.
*
* From: https://dev.to/nektro/createimagebitmap-polyfill-for-safari-and-edge-228
* Updated by Yoan Tournade <yoan@ytotech.com>
*
* Gist found here:
* https://gist.github.com/MonsieurV/fb640c29084c171b4444184858a91bc7
*/
if (!('createImageBitmap' in window)) {
  (window as any).createImageBitmap = async function (data: any) {
    return new Promise((resolve,reject) => {
      let dataURL;
      if (data instanceof Blob) {
        dataURL = URL.createObjectURL(data);
      } else if (data instanceof ImageData) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = data.width;
        canvas.height = data.height;
        ctx!.putImageData(data,0,0);
        dataURL = canvas.toDataURL();
      } else {
        throw new Error('createImageBitmap does not handle the provided image source type');
      }
      const img = document.createElement('img');
      img.addEventListener('load',function () {
        resolve(this);
      });
      img.src = dataURL;
    });
  };
}

class SpectrogramComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  updateCanvas() {
    const ctx = (this.refs.canvas as any).getContext('2d');
    // let width = 300;
    // let height = 80;
    // ctx.clearRect(0,0, width, height);

    if (this.props.currentSpectrogram !== undefined) {
      let width = this.props.currentSpectrogram!.width;
      let height = this.props.currentSpectrogram!.height;

      let pixels = this.props.currentSpectrogram.calculatePixelsForMode(this.props.spectrogramMode);

      var image = new ImageData(pixels, width, height);

      createImageBitmap(image).then(renderer => {
        ctx.drawImage(renderer, 0, 0, width * 3, height * 3)
      });
    }
  }


  public render() {
    let width = 150 * 3;
    let height = 80 * 3;

    if (this.props.currentSpectrogram !== undefined) {
      width = this.props.currentSpectrogram.width * 3;
      height = this.props.currentSpectrogram.height * 3;
    }

    let nextMode = nextSpectrogramMode(this.props.spectrogramMode);

    // TODO: This needs to go way up the tree.
    let canvas = <canvas 
      ref="canvas" 
      width={width}
      height={height}
      id="spectrogram"
      onClick={() => this.props.changeSpectrogramMode(nextMode)}
      />

    return (
      <div>
        {canvas}
        <p>(Click or tap to change spectrogram theme.)</p>
      </div>
    )
  }
}

export { SpectrogramComponent };
