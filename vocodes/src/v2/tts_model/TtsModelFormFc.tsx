import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../v1/api/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useHistory, Link } from "react-router-dom";

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

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsModelFormFc(props: Props) {
  let history = useHistory();

  const [ttsModels, setTtsModels] = useState<Array<TtsModel>>([]);
  const [selectedTtsModel, setSelectedTtsModel] = useState<TtsModel|undefined>(undefined);

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

      setTtsModels(ttsModelResponse.models)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, []); // NB: Empty array dependency sets to run ONLY on mount

  let listItems: Array<JSX.Element> = [];
  let doSelect = true;

  ttsModels.forEach(m => {
    let option = (
      <option 
        value={m.model_token} 
        selected={doSelect}>{m.title} (by {m.creator_username})</option>
    );

    listItems.push(option);
    doSelect = false;
  });


  let extraDetails = <p />;

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
  }

  let selectClasses = 'select is-large';

  if (listItems.length === 0) {
    selectClasses = 'select is-large is-loading';
    listItems.push((
      <option value="" disabled={true}>Loading...</option>
    ))
  }

  let remainingCharactersButtonDisabled = false;

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();
    return false;
  };

  const handleCancelClick = (ev: React.FormEvent<HTMLButtonElement>) => { 
    ev.preventDefault();
    return false;
  };

  return (
    <div>
      <h1 className="title is-1"> Deep Fake Text to Speech </h1>

      {extraDetails}

      <br />

      <form onSubmit={handleFormSubmit}>
        <div className={selectClasses}>
          <select>
            {listItems}
          </select>
        </div>

        <br />
        <br />

        <div className="field">
          <div className="control">
            <textarea className="textarea is-large" placeholder="Textual shenanigans go here..."></textarea>
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

    </div>
  )
}

export { TtsModelFormFc };
