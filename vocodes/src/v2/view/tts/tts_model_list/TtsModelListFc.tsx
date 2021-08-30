import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '../../../../common/ApiConfig';
import { Link } from 'react-router-dom';
import { SessionTtsInferenceResultListFc } from '../../_common/SessionTtsInferenceResultsListFc';
import { SessionTtsModelUploadResultListFc } from '../../_common/SessionTtsModelUploadResultsListFc';
import { SessionW2lInferenceResultListFc } from '../../_common/SessionW2lInferenceResultsListFc';
import { SessionW2lTemplateUploadResultListFc } from '../../_common/SessionW2lTemplateUploadResultsListFc';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { TtsInferenceJob } from '../../../../App';
import { TtsModelUploadJob } from '../../../../jobs/TtsModelUploadJobs';
import { W2lInferenceJob } from '../../../../jobs/W2lInferenceJobs';
import { W2lTemplateUploadJob } from '../../../../jobs/W2lTemplateUploadJobs';
import { v4 as uuidv4 } from 'uuid';
import { ListTtsModels, TtsModelListItem } from '../../../api/tts/ListTtsModels';
import { GravatarFc } from '../../_common/GravatarFc';


export interface EnqueueJobResponsePayload {
  success: boolean,
  inference_job_token?: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueTtsJob: (jobToken: string) => void,
  ttsInferenceJobs: Array<TtsInferenceJob>,
  ttsModelUploadJobs: Array<TtsModelUploadJob>,
  w2lInferenceJobs: Array<W2lInferenceJob>,
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>,
  textBuffer: string,
  setTextBuffer: (textBuffer: string) => void,
  clearTextBuffer: () => void,
}

function TtsModelListFc(props: Props) {
  const [ttsModels, setTtsModels] = useState<Array<TtsModelListItem>>([]);

  const [selectedTtsModel, setSelectedTtsModel] = useState<TtsModelListItem|undefined>(undefined);

  const listModels = useCallback(async () => {
    const models = await ListTtsModels();
    if (models) {
      setTtsModels(models);
      if (models.length > 0) {
        setSelectedTtsModel(models[0]);
      }
    }
  }, []);

  useEffect(() => {
    listModels();
  }, [listModels]);

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
        setSelectedTtsModel(model);
      }
    });

    return false;
  };

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => { 
    const textValue = (ev.target as HTMLTextAreaElement).value;
    props.setTextBuffer(textValue);
  };


  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (selectedTtsModel === undefined) {
      return false;
    }

    if (props.textBuffer === undefined) {
      return false;
    }

    const modelToken = selectedTtsModel!.model_token;

    const api = new ApiConfig();
    const endpointUrl = api.inferTts();
    
    const request = {
      uuid_idempotency_token: uuidv4(),
      tts_model_token: modelToken,
      inference_text: props.textBuffer,
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
      let response : EnqueueJobResponsePayload = res;
      if (!response.success || response.inference_job_token === undefined) {
        return;
      }

      props.enqueueTtsJob(response.inference_job_token);
    })
    .catch(e => {
    });

    return false;
  };

  const handleClearClick = (ev: React.FormEvent<HTMLButtonElement>) => { 
    ev.preventDefault();
    props.clearTextBuffer();
    return false;
  };

  let directViewLink = <span />;

  if (selectedTtsModel !== undefined) {
    let modelLink = `/tts/${selectedTtsModel.model_token}`;
    directViewLink = (
      <Link to={modelLink}>
        See more details about the "<strong>{selectedTtsModel.title}</strong>" model 
        by&nbsp;<strong>{selectedTtsModel.creator_display_name}</strong>&nbsp; 
        <GravatarFc 
          size={15}
          username={selectedTtsModel.creator_display_name}
          email_hash={selectedTtsModel.creator_gravatar_hash} /> 
      </Link>
    );
  }

  return (
    <div>
      <h1 className="title is-1"> Deep Fake Text to Speech </h1>
      <h5 className="subtitle is-5">
        Say stuff with your favorite characters.
      </h5>

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

        {directViewLink}

        <br />
        <br />

        <div className="field">
          <div className="control">
            <textarea 
              onChange={handleChangeText}
              className="textarea is-large" 
              value={props.textBuffer}
              placeholder="Textual shenanigans go here..."></textarea>
          </div>
        </div>

        <div className="button-group">
          <div className="columns is-mobile">
            <div className="column has-text-centered">
              <button className="button is-info is-large" disabled={remainingCharactersButtonDisabled}>Speak</button>
            </div>
            <div className="column has-text-centered">
              <button className="button is-info is-light is-large" onClick={handleClearClick}>Clear</button>
            </div>
          </div>
        </div>

      </form>

      <br />
      <br />
      <SessionTtsInferenceResultListFc ttsInferenceJobs={props.ttsInferenceJobs} />

      <br />
      <br />

      <SessionW2lInferenceResultListFc
        w2lInferenceJobs={props.w2lInferenceJobs}
        />
      <br />
      <br />

      <SessionW2lTemplateUploadResultListFc
        w2lTemplateUploadJobs={props.w2lTemplateUploadJobs}
        />

      <br />
      <br />

      <SessionTtsModelUploadResultListFc
        modelUploadJobs={props.ttsModelUploadJobs}
        />

    </div>
  )
}

export { TtsModelListFc };
