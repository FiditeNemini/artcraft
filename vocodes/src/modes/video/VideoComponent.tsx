import React from 'react';
import { VIDEO_TEMPLATES, VideoTemplate } from './VideoTemplates';
import axios from 'axios';
import { VideoStatsComponent } from './VideoQueueStatsComponent';
import { VideoJob, VideoJobStatus } from './VideoJob';

interface Props {
  currentVideoJob?: VideoJob,
  startVideoJobCallback: (job: VideoJob) => void,
  updateVideoJobCallback: (job: VideoJob) => void,
}

interface State {
  // Before upload
  audioFile?: File,
  selectedVideoTemplate: VideoTemplate,
  // After upload
  jobUuid?: string,
}

class VideoComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      // Before upload
      audioFile: undefined,
      selectedVideoTemplate: VIDEO_TEMPLATES[0],
      // After upload
      jobUuid: undefined,
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
    formData.append('audio', this.state.audioFile!);
    formData.append('video-template', this.state.selectedVideoTemplate.slug);

    // NB: Using 'axios' because 'fetch' was having problems with form-multipart
    // and then interpreting the resultant JSON. Maybe I didn't try hard enough?
    axios.post("https://grumble.works/upload", formData) 
      .then(res => res.data)
      .then(res => {
        if (res.uuid !== undefined) {
          this.setState({
            jobUuid: res.uuid
          });

          let job = new VideoJob(res.uuid, VideoJobStatus.Pending);
          this.props.startVideoJobCallback(job);
        }
      });
    /*.then(function (res) {
      if (res.ok) {
        res.body
      } else if (res.status === 401) {
        // TODO
      }
    }, function (e) {
      // TODO
    });*/

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
        src={videoTemplate.getThumbnailUrl()}
        key={videoTemplate.slug}
        className={className}
        onClick={() => this.selectVideoTemplate(videoTemplate) }
        alt={videoTemplate.name}
        />

      thumbnails.push(thumbnail);
    });

    let audioFilename = '(select a file)';

    if (this.state.audioFile !== undefined) {
      audioFilename = this.state.audioFile.name;
    }

    let videoResults = <div></div>;

    if (this.props.currentVideoJob !== undefined) {
      let videoJob = this.props.currentVideoJob!;
      let downloadUrl = videoJob.getVideoDownloadUrl() || "";

      let statusTitle = "Waiting";
      let statusClassName = "message is-primary";
      let videoPlayer = <div></div>;

      switch (videoJob.jobStatus) {
        case VideoJobStatus.Pending:
          statusTitle = "Waiting In Line";
          statusClassName = "message is-warning"; // yellow
          break;
        case VideoJobStatus.Started:
          statusTitle = "Now Processing";
          statusClassName = "message is-info"; // light blue
          break;
        case VideoJobStatus.Failed:
          statusTitle = "Failed :(";
          statusClassName = "message is-danger"; // red
          break;
        case VideoJobStatus.Completed:
          statusTitle = "Success!";
          statusClassName = "message is-success"; // green
          videoPlayer = (
            <div className="video-wrapper">
              <video controls width="80%">
                <source src={downloadUrl}
                        type="video/webm" />
                Your browser doesn't support video
              </video>
            </div>
          );

          break;
      }

      videoResults = (
        <article className={statusClassName}>
          <div className="message-header">
            <p>{statusTitle}</p>
          </div>
          <div className="message-body">
            <p>Your results are currently processing and may take awhile.
            Open this URL in a new tab and keep it open:</p>

            {videoPlayer}

            <p><a 
              href={downloadUrl} 
              rel="noopener noreferrer"
              target="_blank">{downloadUrl}</a></p>

            <p>Please note that this will look like an error message ("The 
              specified key does not exist.") at first. 
              Refresh it again later. I'm still working on the frontend code 
              that will include a progress bar.</p>
          </div>
        </article>
      );
    }

    return (
      <div className="content is-4 is-size-5">
        <h1 className="title is-3"> Deep Fake Video Beta </h1>

        <VideoStatsComponent />

        {videoResults}

        <div className="content is-size-4">
          <p>
            Upload audio from vo.codes or any other source (music, other websites) and pick 
            a video template below. The audio shouldn't be too long or it will fail.
          </p>
        </div>

        <form onSubmit={this.handleFormSubmit}>

          <div className="upload-box">
            <div className="file has-name is-large">
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
                    Choose audio file&hellip;
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

          <button className="button is-large is-success">Submit</button>

        </form>

        <br/>

        <div className="content is-size-5">
          <p>
            <strong>Disclaimer:</strong> Do not defame, defraud, or use for commercial purposes.
          </p>
        </div>
        <br />
      </div>
    )
  }
}


export { VideoComponent };
