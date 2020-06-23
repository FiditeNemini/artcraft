import React from 'react';
import { Spectrogram } from './Spectrogram';

interface Props {
  currentSpectrogram?: Spectrogram,
}

interface State {
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

      var image = new ImageData(this.props.currentSpectrogram!.pixels, width, height);

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

    // TODO: This needs to go way up the tree.
    let canvas = <canvas ref="canvas" width={width} height={height} id="spectrogram" />

    return (
      <div>
        {canvas}
      </div>
    )
  }
}

export { SpectrogramComponent };
