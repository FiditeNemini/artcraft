import React from 'react';
import { VIDEO_TEMPLATES, VideoTemplate } from './VideoTemplates';
import axios from 'axios';
import { VideoJob, VideoJobStatus } from './VideoJob';
import { VideoQueuePoller } from './VideoQueuePoller';
import { VideoQueueStats } from './VideoQueueStats';
import { IMAGE_TEMPLATES, ImageTemplate } from './ImageTemplates';

interface Props {
  currentVideoJob?: VideoJob,
  videoQueueStats: VideoQueueStats,
  videoQueuePoller: VideoQueuePoller,
  startVideoJobCallback: (job: VideoJob) => void,
  updateVideoJobCallback: (job: VideoJob) => void,
  updateVideoQueueStatsCallback: (stats: VideoQueueStats) => void,
}

interface State {
  // Before upload
  audioFile?: File,
  selectedVideoTemplate?: VideoTemplate,
  selectedImageTemplate?: ImageTemplate,
  imageFile?: File,
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
      selectedImageTemplate: undefined,
      imageFile: undefined,
      // After upload
      jobUuid: undefined,
    };
  }

  componentDidMount() {
    this.props.videoQueuePoller.start();
  }

  componentWillUnmount() {
    this.props.videoQueuePoller.stop();
  }

  handleAudioFileChange = (fileList: FileList|null) => {
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

  handleImageFileChange = (fileList: FileList|null) => {
    if (fileList === null 
        || fileList === undefined
        || fileList.length < 1) {
      this.setState({
        selectedVideoTemplate: VIDEO_TEMPLATES[0], // Return to old default for now.
        selectedImageTemplate: undefined,
        imageFile: undefined,
      });
    }

    let file = fileList![0];

    this.setState({
      imageFile: file,
      selectedVideoTemplate: undefined,
      selectedImageTemplate: undefined,
    });
  }

  selectVideoTemplate = (videoTemplate: VideoTemplate) => {
    this.setState({
      selectedVideoTemplate: videoTemplate,
      selectedImageTemplate: undefined,
      imageFile: undefined,
    });
  }

  selectImageTemplate = (imageTemplate: ImageTemplate) => {
    this.setState({
      selectedImageTemplate: imageTemplate,
      selectedVideoTemplate: undefined,
      imageFile: undefined,
    });
  }


  handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    if (this.state.audioFile === undefined) {
      return false;
    }

    let formData = new FormData();
    formData.append('audio', this.state.audioFile!);

    if (this.state.selectedVideoTemplate !== undefined) {
      formData.append('video-template', this.state.selectedVideoTemplate.slug);
    }

    if (this.state.selectedImageTemplate !== undefined) {
      formData.append('image-template', this.state.selectedImageTemplate.slug);
    }

    if (this.state.imageFile !== undefined) {
      formData.append('image', this.state.imageFile);
    }

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

          // Make sure we show the processing status modal
          window.scrollTo(0, document.body.scrollHeight);
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

  public getImageThumbnails() : any[] {
    let imageThumbnails : any[] = [];
    let selectedTemplateSlug = this.state.selectedImageTemplate?.slug || '';

    IMAGE_TEMPLATES.forEach(imageTemplate => {
      let selectedName = '';
      if (selectedTemplateSlug === imageTemplate.slug) {
        selectedName = 'selected';
      }
      let className = `thumbnail ${selectedName}`
      let thumbnail = <img
        src={imageTemplate.getThumbnailUrl()}
        key={imageTemplate.slug}
        className={className}
        onClick={() => this.selectImageTemplate(imageTemplate) }
        alt={imageTemplate.name}
        />

      imageThumbnails.push(thumbnail);
    });

    return imageThumbnails;
  }

  public getVideoThumbnails() : any[] {
    let videoThumbnails : any[] = [];
    let selectedTemplateSlug = this.state.selectedVideoTemplate?.slug || '';

    VIDEO_TEMPLATES.forEach(videoTemplate => {
      let selectedName = '';
      if (selectedTemplateSlug === videoTemplate.slug) {
        selectedName = 'selected';
      }
      let className = `thumbnail ${selectedName}`
      let thumbnail = <img
        src={videoTemplate.getThumbnailUrl()}
        key={videoTemplate.slug}
        className={className}
        onClick={() => this.selectVideoTemplate(videoTemplate) }
        alt={videoTemplate.name}
        />

      videoThumbnails.push(thumbnail);
    });

    return videoThumbnails;
  }

  public render() {
    let imageThumbnails = this.getImageThumbnails();
    let videoThumbnails = this.getVideoThumbnails();

    let audioFilename = '(select a file)';
    let imageFilename = '(select a file)';

    if (this.state.audioFile !== undefined) {
      audioFilename = this.state.audioFile.name;
    }

    if (this.state.imageFile !== undefined) {
      imageFilename = this.state.imageFile.name;
    }

    let videoResults = <div></div>;

    if (this.props.currentVideoJob !== undefined) {
      let videoJob = this.props.currentVideoJob!;
      let downloadUrl = videoJob.getVideoDownloadUrl() || "";

      // Variable components
      let statusTitle = "Waiting";
      let statusClassName = "message is-primary";
      let statusMessage = "";
      let preLinkText = "If you would like to walk away and come back later, copy the "
          + "following URL. Your results will be posted here later:"
      let postLinkText = 'Please note that this will look like an error message ("The '
          + 'specified key does not exist.") at first. Refresh it again later.'
      let videoPlayer = <div></div>;

      switch (videoJob.jobStatus) {
        case VideoJobStatus.Pending:
          statusTitle = "Waiting In Line";
          statusClassName = "message is-warning"; // yellow
          statusMessage = "Your request has been submitted and is waiting in line for processing. This may take awhile.";
          break;
        case VideoJobStatus.Started:
          statusTitle = "Now Processing";
          statusClassName = "message is-info"; // light blue
          statusMessage = "Your request is currently being processed. We're almost done, but it might take up to a few minutes.";
          break;
        case VideoJobStatus.Failed:
          statusTitle = "Failed :(";
          statusClassName = "message is-danger"; // red
          statusMessage = "There was a problem processing your request. Either the audio is bad (too long, "
            + "corrupt, etc.), there was a problem with face detection, or the video itself is corrupt. Cartoon "
            + "images are known to frequently fail face detection. If you're using a cartoon image, it "
            + "probably won't work.";
          preLinkText = "";
          postLinkText = "";
          break;
        case VideoJobStatus.Completed:
          statusTitle = "Success!";
          statusClassName = "message is-success"; // green
          statusMessage = "Your video is complete!";
          preLinkText = "Download your video here:";
          postLinkText = "";
          videoPlayer = (
            <div className="video-wrapper">
              <video controls width="80%">
                <source src={downloadUrl}
                        type="video/webm" />
                Your browser doesn't support video
              </video>
              <br />
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
            <p>{statusMessage}</p>

            {videoPlayer}

            <p>{preLinkText}</p>

            <p><a 
              href={downloadUrl} 
              rel="noopener noreferrer"
              target="_blank">{downloadUrl}</a></p>

            <p>{postLinkText}</p>
          </div>
        </article>
      );
    }

    return (
      <div className="content is-4 is-size-5">
        <h1 className="title is-3"> Lipsync Video Beta </h1>

        <div className="content is-size-4">
          <p>
            Upload audio from vo.codes or any other source (music, other websites), 
            then pick a template below. The audio shouldn't be too long or it will
            fail.
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
                  onChange={ (e) => this.handleAudioFileChange(e.target.files) }
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

          <h4 className="title is-4"> Video Templates </h4>

          <div className="video-template-selector">
            {videoThumbnails.map(v => v)}
          </div>

          <h4 className="title is-4"> Image Templates </h4>

          <div className="video-template-selector">
            {imageThumbnails.map(v => v)}
          </div>

          <h4 className="title is-4"> Or Upload Your Own Image </h4>
          <p><strong>Note:</strong> cartoon images typically do not work since the 
          faces aren't always detected. Video is not supported at this time due to 
          limited server capacity.</p>

          <div className="upload-box">
            <div className="file has-name is-large">
              <label className="file-label">
                <input 
                  type="file" 
                  name="image" 
                  className="file-input" 
                  onChange={ (e) => this.handleImageFileChange(e.target.files) }
                  />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fas fa-upload"></i>
                  </span>
                  <span className="file-label">
                    Choose image file&hellip;
                  </span>
                </span>
                <span className="file-name">
                  {imageFilename}
                </span>
              </label>
            </div>
          </div>

          <button className="button is-large is-success">Submit</button>
        </form>
        
        <br/>

        <div className="content is-size-4">
          <p>
            <strong>Queue Length: {this.props.videoQueueStats.queueLength}</strong> (Each takes ~30 seconds.) 
          </p>
        </div>

        {videoResults}

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
