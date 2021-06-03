
import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { useParams, Link } from 'react-router-dom';
import { SessionWrapper } from '../../session/SessionWrapper';
//import { v1 as uuidv1 } from 'uuid';

interface TtsModelViewResponsePayload {
  success: boolean,
  model: TtsModel,
}

interface TtsModel {
  model_token: string,
  title: string,
  tts_model_type: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  updatable_slug: string,
  created_at: string,
  updated_at: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsModelViewFc(props: Props) {
  let { token } = useParams();

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.viewTtsModel(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsModelViewResponsePayload = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsModel(modelsResponse.model)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [token]); // NB: Empty array dependency sets to run ONLY on mount

  /*const handleAudioFileChange = (fileList: FileList|null) => {
    if (fileList === null 
        || fileList === undefined
        || fileList.length < 1) {
      setAudioFile(undefined);
    }

    let file = fileList![0];
    setAudioFile(file);
  };*/

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    /*if (audioFile === undefined) {
      return false;
    }

    if (ttsModel === undefined) {
      return false;
    }

    const modelToken = ttsModel!.model_token;

    let formData = new FormData();
    formData.append('audio', audioFile!);
    formData.append('model_token', modelToken);
    formData.append('uuid_idempotency_token', uuidv1()!);

    const api = new ApiConfig();
    const endpointUrl = api.inferW2l();

    // NB: Using 'axios' because 'fetch' was having problems with form-multipart
    // and then interpreting the resultant JSON. Maybe I didn't try hard enough?
    axios.post(endpointUrl, formData, { withCredentials: true }) 
      .then(res => res.data)
      .then(res => {
        //if (res.uuid !== undefined) {
        //  this.setState({
        //    jobUuid: res.uuid
        //  });

        //  //let job = new VideoJob(res.uuid, VideoJobStatus.Pending);
        //  //this.props.startVideoJobCallback(job);

        //  // Make sure we show the processing status modal
        //  window.scrollTo(0, document.body.scrollHeight);
        //}

        //console.log(res);
      });*/


    return false;
  };

  let creatorLink=`/profile/${ttsModel?.creator_username}`;

  let title = 'TTS Model'
  if (ttsModel?.title !== undefined) {
      title = `${ttsModel.title} model`;
  }
  
  return (
    <div>
      <h1 className="title is-1"> {title} </h1>

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
              <Link to={creatorLink}>{ttsModel?.creator_display_name}</Link>
            </td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{ttsModel?.title}</td>
          </tr>
          <tr>
            <th>Model Type</th>
            <td>{ttsModel?.tts_model_type}</td>
          </tr>
          <tr>
            <th>Upload Date (UTC)</th>
            <td>{ttsModel?.created_at}</td>
          </tr>
        </tbody>
      </table>

      <br />

      <h3 className="title is-3"> Use Model </h3>

      <form onSubmit={handleFormSubmit}>
        <textarea 
            className="textarea is-large" 
            placeholder="Textual shenanigans go here..."></textarea>

        <button className="button is-large is-fullwidth is-success">Submit</button>
      </form>
    
      <br />
      <br />
      <Link to="/">&lt; Back to all models</Link>

      <br />
    </div>
  )
}

export { TtsModelViewFc };
