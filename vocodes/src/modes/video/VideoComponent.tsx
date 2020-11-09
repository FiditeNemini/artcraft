import React from 'react';
import { VIDEO_TEMPLATES, VideoTemplate } from './Videos';

interface Props {
}

interface State {
  audioFile?: File,
  selectedVideoTemplate: VideoTemplate,
}

class VideoComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      audioFile: undefined,
      selectedVideoTemplate: VIDEO_TEMPLATES[0],
    };
  }

  handleFileChange = (fileList: FileList|null) => {
    if (fileList === null 
        || fileList === undefined
        || fileList.length < 1) {
      this.setState({
        audioFile: undefined,
      });
    }

    let file = fileList![0];

    this.setState({
      audioFile: file,
    });
  }

  selectVideoTemplate = (videoTemplate: VideoTemplate) => {
    this.setState({
      selectedVideoTemplate: videoTemplate,
    });
  }

  handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    if (this.state.audioFile === undefined) {
      return false;
    }

    let formData = new FormData();
    formData.append( 'audio', this.state.audioFile!);
    formData.append('video-template', this.state.selectedVideoTemplate.slug);

    fetch("http://34.95.89.220/upload", {
      mode: 'no-cors',
      method: "POST",
      body: formData,
    })
    .then(function (res) {
      if (res.ok) {
        alert("Perfect! ");
      } else if (res.status == 401) {
        alert("Oops! ");
      }
    }, function (e) {
      alert("Error submitting form!");
    });

    return false;
  }

  public render() {
    let thumbnails : any[] = [];

    VIDEO_TEMPLATES.forEach(videoTemplate => {
      let selectedName = '';
      if (this.state.selectedVideoTemplate.slug === videoTemplate.slug) {
        selectedName = 'selected';
      }
      let className = `video-thumbnail ${selectedName}`
      let thumbnail = <img
        className={className}
        src={videoTemplate.getThumbnailUrl()}
        onClick={() => this.selectVideoTemplate(videoTemplate) }
        />

      thumbnails.push(thumbnail);
    });

    let audioFilename = '(select a file)';

    if (this.state.audioFile !== undefined) {
      audioFilename = this.state.audioFile.name;
    }

    return (
      <div className="content is-4 is-size-5">
        <h1 className="title is-3"> Deep Fake Video Beta </h1>

        <div className="content is-size-4">
          <p>
            Upload audio from vo.codes or any other source and pick a video template 
            below.
          </p>
        </div>

        <form onSubmit={this.handleFormSubmit}>

          <div className="upload-box">
            <div className="file has-name is-boxed is-large">
              <label className="file-label">
                <input 
                  type="file" 
                  name="audio" 
                  className="file-input" 
                  onChange={ (e) => this.handleFileChange(e.target.files) }
                  />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fas fa-upload"></i>
                  </span>
                  <span className="file-label">
                    Choose a file…
                  </span>
                </span>
                <span className="file-name">
                  {audioFilename}
                </span>
              </label>
            </div>
          </div>

          <div className="video-template-selector">
            {thumbnails.map(v => v)}
          </div>

          <div className="content is-size-4">
            <p>
              Hundreds of additional templates will be added in the future. 
              Feel free to send some to us. As always, check Discord or 
              like/subscribe Twitter for updates.
            </p>
          </div>

          <button className="button is-large is-success">Submit</button>

        </form>

        <h1 className="title is-4"> Notes </h1>

        <div className="content is-size-4">
          <p>
            This is a brand new, beta feature. It might break. 
            I need to reach out to Google Cloud sales engineers to get more GPUs as I'm 
            currently on a limited trial account (I was previously on Digital Ocean).
            Expect this to lag during peak traffic until I get more GPUs.
          </p>
          <p>
            Do not defame, defraud, or use for commercial purposes. Deep fakes
            are for memes. The more people see deep fakes, the more they learn to
            recognize them. It's your privilege to help educate the world about 
            deep fakes. Have fun, go crazy.
          </p>
        </div>
      </div>
    )
  }
}


export { VideoComponent };
