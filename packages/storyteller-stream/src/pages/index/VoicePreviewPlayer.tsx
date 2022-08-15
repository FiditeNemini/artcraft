import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPlay } from "@fortawesome/free-solid-svg-icons";
import Wavesurfer from "react-wavesurfer.js";
import AudioSampleButton from "./AudioSampleButton";

export default class MyComponent extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      playing: false,
      pos: 0,
    };
    this.handleTogglePlay = this.handleTogglePlay.bind(this);
    this.handlePosChange = this.handlePosChange.bind(this);
  }
  handleTogglePlay() {
    this.setState({
      playing: !this.state.playing,
    });
  }
  handlePosChange(e: any) {
    this.setState({
      pos: e.originalArgs[0],
    });
  }

  render() {
    let wavesurferConfigs = [
      {
        filename: "/assets/preview/tracer.wav",
        title: "Tracer (Overwatch)",
      },
      {
        filename: "/assets/preview/son-goku.wav",
        title: "Son Goku (Sean Schemmel)",
      },
      {
        filename: "/assets/preview/stan-lee.wav",
        title: "Stan Lee",
      },
    ];

    let wavesurfers = wavesurferConfigs.map((config) => {
      let ws = (
        <div className="col-12 col-lg-4">
          <div className="panel p-3">
            <div className="d-flex gap-3 align-items-center mb-4">
              <button
                className="btn btn-primary btn-voice-preview align-items-center justify-content-center"
                onClick={() => this.handleTogglePlay()}
              >
                <FontAwesomeIcon icon={faPlay} />
              </button>
              <span className="fw-semibold voice-preview-text">
                <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                {config.title}
              </span>
            </div>
            <div className="w-100 h-100 my-2">
              <Wavesurfer
                src={config.filename}
                barWidth={2}
                barRadius={1}
                barGap={2}
                barMinHeight={1}
                barHeight={2}
                height={20}
                progressColor="#fc8481"
                waveColor="#b09e9e"
                cursorColor="transparent"
                playing={this.state.playing}
                responsive={true}
              />
            </div>
          </div>
        </div>
      );
      return ws;
    });
    return <div className="row gx-4 gy-4">{wavesurfers}</div>;
  }
}
