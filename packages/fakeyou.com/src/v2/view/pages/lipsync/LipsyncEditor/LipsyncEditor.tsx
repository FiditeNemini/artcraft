import React from "react";
import { useUploader } from "hooks";
import { Uploader } from "components/common";
import { PageHeader } from "components/layout";
import './LipsyncEditor.scss';

// interface Props {
//   titleIcon?: JSX.Element;
//   extra?: React.ComponentType;
//   title?: string;
//   subText: string;
//   showButtons: boolean;
//   actionButtons?: JSX.Element;
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
  console.log('🥚',rest)
  return <div {...{ className: 'progress-header' }}>
    <h1 {...{ className: "fw-bold text-center text-md-start progress-heading" }}>
      Generate a lipsync
    </h1>
    <ul {...{ className: 'async-progress-tracker' }}>
      <li>
        <ProgressCheck {...{}}/>
        Image
      </li>
      <li>
        <ProgressCheck {...{ disabled: false }}/>
        Audio
      </li>
    </ul>
    <button className="btn btn-primary">
    Generate
    </button>
  </div>
};

export default function LipsyncEditor({ ...rest }) {
  const { file: audioFile, ...uploader } = useUploader({});

  const subText = "Select an image with a clear face, or one of our existing templates, then choose either text to speech or uploaded audio(eg. music). Then you can generate a beautifully lipsynced video.";
  const headerProps = {
    childProps: { audioFile },
    titleComponent: Title,
    subText,
    showButtons: false
  };

	return <div>
    <PageHeader { ...headerProps }/>
      <div className="container">
        <div className="panel d-flex p-md-4">
          <div {...{ className: "col-12 col-lg-6" }}>
            <h5>Image</h5>
          </div>
          <div {...{ className: "col-12 col-lg-6" }}>
            <h5>Audio</h5>
            <Uploader {...{ file: audioFile, ...uploader }}/>
          </div>
        </div>
      </div>
	</div>;
};