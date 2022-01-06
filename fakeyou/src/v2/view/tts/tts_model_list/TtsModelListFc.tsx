import React, { useEffect, useCallback } from 'react';
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
import { TtsModelListNotice } from './TtsModelListNotice';
import { ListTtsCategories, ListTtsCategoriesIsError, ListTtsCategoriesIsOk, TtsCategory } from '../../../api/category/ListTtsCategories';
import { MultiDropdownSearch } from './MultiDropdownSearch';

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

  ttsModels: Array<TtsModelListItem>,
  setTtsModels: (ttsVoices: Array<TtsModelListItem>) => void,

  allTtsCategories: TtsCategory[],
  setAllTtsCategories: (allTtsCategories: TtsCategory[]) => void,

  allTtsCategoriesByTokenMap: Map<string,TtsCategory>,
  allTtsModelsByTokenMap: Map<string,TtsModelListItem>,
  ttsModelsByCategoryToken: Map<string,Set<TtsModelListItem>>,

  dropdownCategories: TtsCategory[][],
  setDropdownCategories: (dropdownCategories: TtsCategory[][]) => void,
  selectedCategories: TtsCategory[],
  setSelectedCategories: (selectedCategories: TtsCategory[]) => void,

  maybeSelectedTtsModel?: TtsModelListItem,
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void,
}

function TtsModelListFc(props: Props) {

  let { 
    setTtsModels, 
    setAllTtsCategories, 
    //setCurrentTtsModelSelected, 
    //currentTtsModelSelected, 
    ttsModels, 
    allTtsCategories,
    maybeSelectedTtsModel,
    setMaybeSelectedTtsModel,
  } = props;

  const ttsModelsLoaded = ttsModels.length > 0;
  const ttsCategoriesLoaded = allTtsCategories.length > 0;

  const listModels = useCallback(async () => {
    if (ttsModelsLoaded) {
      console.log('models already queried');
      return; // Already queried.
    }
    const models = await ListTtsModels();
    if (models) {
      setTtsModels(models);
      if (!maybeSelectedTtsModel && models.length > 0) {
        const model = models[0];
        setMaybeSelectedTtsModel(model);
      }
    }
  }, [setTtsModels, maybeSelectedTtsModel, setMaybeSelectedTtsModel, ttsModelsLoaded]);

  const listTtsCategories = useCallback(async () => {
    if (ttsCategoriesLoaded) {
      console.log('categories already queried');
      return; // Already queried.
    }
    const categoryList = await ListTtsCategories();
    if (ListTtsCategoriesIsOk(categoryList)) {
      setAllTtsCategories(categoryList.categories);
    } else if (ListTtsCategoriesIsError(categoryList))  {
      // TODO: Retry on decay function
    }
  }, [setAllTtsCategories, ttsCategoriesLoaded]);

  useEffect(() => {
    listModels();
    listTtsCategories();
  }, [listModels, listTtsCategories]);

  // TODO: I never did anything with this.
  let remainingCharactersButtonDisabled = false;

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => { 
    const textValue = (ev.target as HTMLTextAreaElement).value;
    props.setTextBuffer(textValue);
  };

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (!props.maybeSelectedTtsModel) {
      return false;
    }

    if (!props.textBuffer) {
      return false;
    }

    const modelToken = props.maybeSelectedTtsModel!.model_token;

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

  if (props.maybeSelectedTtsModel) {
    let modelLink = `/tts/${props.maybeSelectedTtsModel.model_token}`;
    directViewLink = (
      <Link to={modelLink}>
        See more details about the "<strong>{props.maybeSelectedTtsModel.title}</strong>" model 
        by&nbsp;<strong>{props.maybeSelectedTtsModel.creator_display_name}</strong>&nbsp; 
        <GravatarFc 
          size={15}
          username={props.maybeSelectedTtsModel.creator_display_name}
          email_hash={props.maybeSelectedTtsModel.creator_gravatar_hash} /> 
      </Link>
    );
  }

  return (
    <div>
      <h1 className="title is-1"> FakeYou Text to Speech </h1>
      <h5 className="subtitle is-5">
        Use deep fake tech to say stuff with your favorite characters.
      </h5>

      <TtsModelListNotice />

      <form onSubmit={handleFormSubmit}>

        <MultiDropdownSearch 
          allTtsCategories={props.allTtsCategories} 
          allTtsModels={props.ttsModels}
          allTtsCategoriesByTokenMap={props.allTtsCategoriesByTokenMap}
          allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
          ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
          dropdownCategories={props.dropdownCategories}
          setDropdownCategories={props.setDropdownCategories}
          selectedCategories={props.selectedCategories}
          setSelectedCategories={props.setSelectedCategories}
          maybeSelectedTtsModel={props.maybeSelectedTtsModel}
          setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
          />


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
