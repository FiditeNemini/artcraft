import React from "react";
import { useUploader } from "hooks";
import { AudioUploader, ImageUploader } from "components/common";
import { PageHeader } from "components/layout";
import './LipsyncEditor.scss';

// interface Props {
//   audioFile?: any;
//   imageFile?: any;
// }

const ProgressCheck = ({ disabled = false }: {disabled?: boolean}) => <svg>
  { !disabled && <polyline {...{
    fill: 'none',
    points: '7 16 12 20 20 10',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '4',
  }}/> }
</svg>;

const Title = ({ ...rest }) => {
  const { audioFile, imageFile } = rest;

  return <div {...{ className: 'progress-header' }}>
    <h1 {...{ className: "fw-bold text-center text-md-start progress-heading" }}>
      Generate a lipsync
    </h1>
    <ul {...{ className: 'async-progress-tracker' }}>
      <li>
        <ProgressCheck {...{ disabled: imageFile }}/>
        Image
      </li>
      <li>
        <ProgressCheck {...{ disabled: audioFile }}/>
        Audio
      </li>
    </ul>
    <button className="btn btn-primary">
    Generate
    </button>
  </div>
};

export default function LipsyncEditor({ ...rest }) {
  const audioProps = useUploader({ debug: 'audio useUploader' });
  const imageProps = useUploader({});

  const subText = "Select an image with a clear face, or one of our existing templates, then choose either text to speech or uploaded audio(eg. music). Then you can generate a beautifully lipsynced video.";
  const headerProps = {
    childProps: { audioFile: !audioProps.file, imageFile: !imageProps.file },
    titleComponent: Title,
    subText,
    showButtons: false
  };

	return <div>
    <PageHeader { ...headerProps }/>
      <div {...{ className: "container" }}>
        <div {...{ className: "lipsync-editor panel" }}>
          <div {...{ className: "grid-heading" }}>
            <h5>Image</h5>
          </div>
          <div {...{ className: "grid-heading" }}>
            <h5>Audio</h5>
          </div>
          <div {...{ className: "grid-square lipsync-audio" }}>
            <ImageUploader {...imageProps}/>
          </div>
          <div {...{ className: "grid-square" }}>
            <AudioUploader {...audioProps}/>
          </div>
        </div>
      </div>
	</div>;
};