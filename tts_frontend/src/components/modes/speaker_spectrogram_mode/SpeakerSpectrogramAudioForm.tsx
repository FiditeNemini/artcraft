import React from 'react';
import Howl from 'howler';
import ApiConfig from '../../../ApiConfig';
import { createColorMap, linearScale } from "@colormap/core";
import { VIRIDIS, CIVIDIS, PLASMA, INFERNO, MAGMA, BLACK_WHITE,  } from "@colormap/presets";
import { SpeakRequest } from '../../../api/ApiDefinition'

interface Props {
  apiConfig: ApiConfig,
  speaker?: String,
  text: string,
  updateTextCallback: (text: string) => void,
}

interface State {
  howl?: Howl,
  spectrogram?: Spectrogram,
}

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

class SpeakerSpectrogramAudioForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      howl: undefined,
      spectrogram: undefined,
    };
  }

  handleTextChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const text = (ev.target as HTMLInputElement).value;
    this.props.updateTextCallback(text);
  }

  makeRequest = (ev: React.FormEvent<HTMLFormElement>) => {
    console.log("Form Submit");

    if (!this.props.text) {
      return;
    }

    let request = new SpeakRequest(this.props.text, this.props.speaker!);

    const url = this.props.apiConfig.getEndpoint('/speak_spectrogram');

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    .then(res => res.json())
    .then(res => {
      const data = `data:audio/wav;base64,${res.audio_base64}`;
      console.log(data);
      
      const audioUrl = new URL(data);
      console.log(audioUrl);

      // var image = new Image();
      // image.src = `data:image/bmp;base64,${res.spectrogram.bytes_base64}`;
      // console.log('image', image);

      let scale = linearScale([0, 255], [0, 1]);
      let colorMap = createColorMap(MAGMA, scale);

      // https://stackoverflow.com/a/21797381
      function base64ToArrayBuffer(base64string: string) : Uint8ClampedArray {
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

      let bytes = base64ToArrayBuffer(res.spectrogram.bytes_base64);

      const spectrogram = new Spectrogram(bytes, res.spectrogram.width, res.spectrogram.height);

      const sound = new Howl.Howl({
        src: [data],
        format: 'wav',
      });
      
      this.setState({
        howl: sound,
        spectrogram: spectrogram,
      });

      sound.play();

      (window as any).sound = sound;
    });

    ev.preventDefault();
    return false;

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

    if (this.state.spectrogram !== undefined) {
      let width = this.state.spectrogram!.width;
      let height = this.state.spectrogram!.height;

      var image = new ImageData(this.state.spectrogram!.pixels, width, height);

      createImageBitmap(image).then(renderer => {
        ctx.drawImage(renderer, 0, 0, width * 3, height * 3)
      });
    }
  }

  public render() {
    let width = 150 * 3;
    let height = 80 * 3;

    if (this.state.spectrogram !== undefined) {
      width = this.state.spectrogram.width * 3;
      height = this.state.spectrogram.height * 3;
    }

    let canvas = <canvas ref="canvas" width={width} height={height} id="spectrogram" />

    return (
      <div>
        {canvas}

        <form onSubmit={this.makeRequest}>
          <input onChange={this.handleTextChange} value={this.props.text} />
          <button>Submit</button>
        </form>
      </div>
    );
  }
}

export default SpeakerSpectrogramAudioForm;
