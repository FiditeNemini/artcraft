import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { RouteProps, useHistory, useParams, Link } from 'react-router-dom';

interface W2lTemplateViewResponsePayload {
  success: boolean,
  template: W2lTemplate,
}

interface W2lTemplate {
  template_token: string,
  template_type: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  updatable_slug: string,
  title: string,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  maybe_image_object_name: string,
  maybe_video_object_name: string,
  created_at: string,
  updated_at: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lTemplateViewFc(props: Props) {
  let history = useHistory();
  let { templateSlug } = useParams();

  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.viewW2l(templateSlug);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      console.log('list', res);
      const templatesResponse : W2lTemplateViewResponsePayload = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lTemplate(templatesResponse.template)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  let creatorLink=`/profile/${w2lTemplate?.creator_username}`;

  let object : string|undefined = undefined;
  
  if (w2lTemplate?.maybe_image_object_name !== undefined && w2lTemplate?.maybe_image_object_name !== null) {
    object = w2lTemplate!.maybe_image_object_name;
  } else if (w2lTemplate?.maybe_video_object_name !== undefined && w2lTemplate?.maybe_video_object_name !== null) {
    object = w2lTemplate!.maybe_video_object_name;
  } else {
  }

  let url = `https://storage.googleapis.com/dev-vocodes-public${object}`;

  const handleAudioFileChange = (fileList: FileList|null) => {
    if (fileList === null 
        || fileList === undefined
        || fileList.length < 1) {
      //this.setState({
      //  audioFile: undefined,
      //});
    }

    let file = fileList![0];

    //this.setState({
    //  audioFile: file,
    //});
  };

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();
    return false;
  };

  const audioFilename = 'filename.todo';


  return (
    <div>
      <h1 className="title is-1"> Video lip sync template </h1>

      <div className="content is-size-4">
        <p>
          Upload audio from vo.codes or any other source (music, other websites), 
          then pick a template below. The audio shouldn't be too long or it will
          fail.
        </p>
      </div>

      <form onSubmit={handleFormSubmit}>

        <div className="upload-box">
          <div className="file has-name is-large">
            <label className="file-label">
              <input 
                type="file" 
                name="audio" 
                className="file-input" 
                onChange={ (e) => handleAudioFileChange(e.target.files) }
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

        <button className="button is-large is-fullwidth is-success">Submit</button>

      </form>

      <br />

      <h3 className="title is-3"> Template Details </h3>

      <img src={url} alt="template preview" />

      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Detail">Detail</abbr></th>
            <th><abbr title="Value">Value</abbr></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Creator</th>
            <td>
              <Link to={creatorLink}>{w2lTemplate?.creator_display_name}</Link>
            </td>
          </tr>
          <tr>
            <th>Media Type</th>
            <td>{w2lTemplate?.template_type}</td>
          </tr>
          <tr>
            <th>Dimensions</th>
            <td>{w2lTemplate?.frame_width} x {w2lTemplate?.frame_height}</td>
          </tr>
          <tr>
            <th>Duration (milliseconds)</th>
            <td>{w2lTemplate?.duration_millis}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export { W2lTemplateViewFc };
