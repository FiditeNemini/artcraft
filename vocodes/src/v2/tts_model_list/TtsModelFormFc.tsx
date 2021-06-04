import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { v1 as uuidv1 } from 'uuid';
import { Link } from 'react-router-dom';
import { TtsInferenceJob } from '../../App';
import { TtsInferenceResultListFc } from './TtsInferenceResultsListFc';

interface TtsModelListResponsePayload {
  success: boolean,
  models: Array<TtsModel>,
}

interface TtsModel {
  model_token: string,
  tts_model_type: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  updatable_slug: string,
  title: string,
  created_at: string,
  updated_at: string,
}

interface EnqueueJobResponsePayload {
  success: boolean,
  inference_job_token?: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueTtsJob: (jobToken: string) => void,
  ttsInferenceJobs: Array<TtsInferenceJob>,
}

function TtsModelFormFc(props: Props) {
  const [ttsModels, setTtsModels] = useState<Array<TtsModel>>([]);

  const [selectedTtsModel, setSelectedTtsModel] = useState<TtsModel|undefined>(undefined);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listTts();

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
      const ttsModelResponse : TtsModelListResponsePayload  = res;
      if (!ttsModelResponse.success) {
        return;
      }

      setTtsModels(ttsModelResponse.models);
      if (ttsModelResponse.models.length > 0) {
        setSelectedTtsModel(ttsModelResponse.models[0]);
      }
    })
    .catch(e => {
      // NO-OP
    });
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  let listItems: Array<JSX.Element> = [];

  let defaultSelectValue = '';

  ttsModels.forEach(m => {
    let option = (
      <option 
        key={m.model_token} 
        value={m.model_token} 
        >{m.title} (by {m.creator_username})</option>
    );

    if (defaultSelectValue === '') {
      defaultSelectValue = m.model_token;
    }

    listItems.push(option);
  });


  /*let extraDetails = <p />;

  if (props.sessionWrapper.isLoggedIn()) {
    extraDetails = (
      <p>
        Pick a template, then you can make it lip sync.
        If you want to use your own video or image, you can
        <Link to="/upload">upload it as a template</Link>.
        You'll then be able to use it whenever you want!
      </p>
    );

  } else {
    extraDetails = (
      <p>
        Pick a template, then you can make it lip sync.
        If you want to use your own video or image, you'll
        need to <Link to="/signup">create an account</Link>.
        You'll then be able to upload and reuse your templates 
        whenever you want!
      </p>
    );
  }*/

  let selectClasses = 'select is-large';

  if (listItems.length === 0) {
    selectClasses = 'select is-large is-loading';
    listItems.push((
      <option key="waiting" value="" disabled={true}>Loading...</option>
    ))
  }

  let remainingCharactersButtonDisabled = false;

  const handleChangeVoice = (ev: React.FormEvent<HTMLSelectElement>) => { 
    ev.preventDefault();
    const selectVoiceValue = (ev.target as HTMLSelectElement).value;

    // TODO: Inefficient.
    ttsModels.forEach(model => {
      if (model.model_token === selectVoiceValue) {
        console.log('voice', model);
        setSelectedTtsModel(model);
      }
    });

    return false;
  };

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => { 
    ev.preventDefault();
    const textValue = (ev.target as HTMLTextAreaElement).value;

    setText(textValue);

    return false;
  };


  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (selectedTtsModel === undefined) {
      return false;
    }

    if (text === undefined) {
      return false;
    }

    const modelToken = selectedTtsModel!.model_token;

    const api = new ApiConfig();
    const endpointUrl = api.inferTts();
    
    // TODO: Idempotency token.
    const request = {
      uuid_idempotency_token: uuidv1(),
      tts_model_token: modelToken,
      inference_text: text,
    }

    fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    })
    .then(res => res.json())
    .then(res => {
      console.log('handleFormSubmit response:', res);
      let response : EnqueueJobResponsePayload = res;
      if (!response.success || response.inference_job_token === undefined) {
        return;
      }

      console.log('enqueuing...')

      props.enqueueTtsJob(response.inference_job_token);
    })
    .catch(e => {
    });

    return false;
  };

  const handleCancelClick = (ev: React.FormEvent<HTMLButtonElement>) => { 
    ev.preventDefault();
    return false;
  };

  let directViewLink = <span />;

  if (selectedTtsModel !== undefined) {
    let modelLink = `/tts/${selectedTtsModel!.model_token}`;
    directViewLink = (
      <Link to={modelLink}>See more details about the "{selectedTtsModel!.title}" model</Link>
    );
  }

  return (
    <div>
      <h1 className="title is-1"> Deep Fake Text to Speech </h1>
      <h4 className="subtitle is-5">
        This is a beta release and temporarily sounds not-great. 
        I'll update the vocoder and allow you to set your own.
      </h4>

      {/*
      <div className="content is-large">
        {extraDetails}
      </div>
      */}

      <br />

      <form onSubmit={handleFormSubmit}>
        <div className={selectClasses}>
          <select 
            onChange={handleChangeVoice} 
            defaultValue={defaultSelectValue}>
            {listItems}
          </select>
        </div>

        <br />
        <br />

        <div className="field">
          <div className="control">
            <textarea 
              onChange={handleChangeText}
              className="textarea is-large" 
              placeholder="Textual shenanigans go here..."></textarea>
          </div>
        </div>

        <div className="button-group">
          <div className="columns is-mobile">
            <div className="column has-text-centered">
              <button className="button is-info is-large" disabled={remainingCharactersButtonDisabled}>Speak</button>
            </div>
            <div className="column has-text-centered">
              <button className="button is-info is-light is-large" onClick={handleCancelClick}>Cancel</button>
            </div>
          </div>
        </div>

      </form>
      <br />
      <br />

      {directViewLink}

      <TtsInferenceResultListFc ttsInferenceJobs={props.ttsInferenceJobs} />


    </div>
  )
}

export { TtsModelFormFc };
