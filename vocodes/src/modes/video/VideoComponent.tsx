import React from 'react';
import { VIDEO_TEMPLATES } from './Videos';

interface Props {
}

interface State {
}

class VideoComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    let thumbnails : any[] = [];

    VIDEO_TEMPLATES.forEach(videoTemplate => {
      
      const thumbnail = <img
        className="video-thumbnail"
        src={videoTemplate.getThumbnailUrl()}
        />

      thumbnails.push(thumbnail);

    });

    return (
      <div className="content is-4 is-size-5">
        <h1 className="title is-3"> Deep Fake Video Beta </h1>

        <div className="content is-size-4">
          <p>
            Upload audio from vo.codes or any other source and pick a video template 
            below.
          </p>
        </div>

        <form action="#">

          <div className="upload-box">
            <div className="file has-name is-boxed is-large">
              <label className="file-label">
                <input className="file-input" type="file" name="audio" />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fas fa-upload"></i>
                  </span>
                  <span className="file-label">
                    Choose a file…
                  </span>
                </span>
                <span className="file-name">
                  Screen Shot 2017-07-29 at 15.54.25.png
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
        </div>
      </div>
    )
  }
}


export { VideoComponent };
