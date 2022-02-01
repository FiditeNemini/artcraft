import React, { useEffect, useCallback } from 'react';
import { ApiConfig } from '../../../../common/ApiConfig';
import { Link } from 'react-router-dom';
import { SessionTtsInferenceResultListFc } from '../../_common/SessionTtsInferenceResultsListFc';
import { SessionTtsModelUploadResultListFc } from '../../_common/SessionTtsModelUploadResultsListFc';
import { SessionW2lInferenceResultListFc } from '../../_common/SessionW2lInferenceResultsListFc';
import { SessionW2lTemplateUploadResultListFc } from '../../_common/SessionW2lTemplateUploadResultsListFc';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { TtsInferenceJob } from '../../../../jobs/TtsInferenceJobs';
import { TtsModelUploadJob } from '../../../../jobs/TtsModelUploadJobs';
import { W2lInferenceJob } from '../../../../jobs/W2lInferenceJobs';
import { W2lTemplateUploadJob } from '../../../../jobs/W2lTemplateUploadJobs';
import { v4 as uuidv4 } from 'uuid';
import { ListTtsModels, TtsModelListItem } from '../../../api/tts/ListTtsModels';
import { GravatarFc } from '../../_common/GravatarFc';
import { VocodesNotice } from './VocodesNotice';
import { ListTtsCategories, ListTtsCategoriesIsError, ListTtsCategoriesIsOk } from '../../../api/category/ListTtsCategories';
import { MultiDropdownSearch } from './MultiDropdownSearch';
import { SyntheticCategory, TtsCategoryType } from '../../../../AppWrapper';
import { AutocompleteSearch } from './AutocompleteSearch';

export interface EnqueueJobResponsePayload {
  success: boolean,
  inference_job_token?: string,
}

interface Props {
  sessionWrapper: SessionWrapper,

  isShowingVocodesNotice: boolean,
  clearVocodesNotice: () => void,

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

  allTtsCategories: TtsCategoryType[],
  setAllTtsCategories: (allTtsCategories: TtsCategoryType[]) => void,

  allTtsCategoriesByTokenMap: Map<string,TtsCategoryType>,
  allTtsModelsByTokenMap: Map<string,TtsModelListItem>,
  ttsModelsByCategoryToken: Map<string,Set<TtsModelListItem>>,

  dropdownCategories: TtsCategoryType[][],
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void,
  selectedCategories: TtsCategoryType[],
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void,

  maybeSelectedTtsModel?: TtsModelListItem,
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void,
}

function TtsModelListFc(props: Props) {

  let { 
    setTtsModels, 
    setAllTtsCategories, 
    ttsModels, 
    allTtsCategories,
    maybeSelectedTtsModel,
    setMaybeSelectedTtsModel,
  } = props;

  const ttsModelsLoaded = ttsModels.length > 0;
  const ttsCategoriesLoaded = allTtsCategories.length > 0;

  const listModels = useCallback(async () => {
    if (ttsModelsLoaded) {
      return; // Already queried.
    }
    const models = await ListTtsModels();
    if (models) {
      dynamicallyCategorizeModels(models);
      setTtsModels(models);
      if (!maybeSelectedTtsModel && models.length > 0) {
        const model = models[0];
        setMaybeSelectedTtsModel(model);
      }
    }
  }, [setTtsModels, maybeSelectedTtsModel, setMaybeSelectedTtsModel, ttsModelsLoaded]);

  const listTtsCategories = useCallback(async () => {
    if (ttsCategoriesLoaded) {
      return; // Already queried.
    }
    const categoryList = await ListTtsCategories();
    if (ListTtsCategoriesIsOk(categoryList)) {
      const serverCategories : TtsCategoryType[] = categoryList.categories;
      const dynamicCategories : TtsCategoryType[] = generateSyntheticCategories();
      const allCategories = serverCategories.concat(dynamicCategories);
      setAllTtsCategories(allCategories);
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

  const vocodesNotice = props.isShowingVocodesNotice ? 
      <VocodesNotice clearVocodesNotice={props.clearVocodesNotice} /> : 
      undefined;

  return (
    <div>

      <section className="hero is-small">
        <div className="hero-body">

          <div className="columns is-vcentered">

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose2_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>

            <div className="column">
              <p className="title">
                Text to Speech*
              </p>
              <p className="subtitle">
                Use <strong>FakeYou</strong> deep fake tech to say stuff with your favorite characters.
              </p>
            </div>

          </div>

        </div>
      </section>

      <br />

      {vocodesNotice}

      <form onSubmit={handleFormSubmit} className="main-form">

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

        <AutocompleteSearch
          allTtsCategories={props.allTtsCategories} 
          allTtsModels={props.ttsModels}
          allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
          dropdownCategories={props.dropdownCategories}
          setDropdownCategories={props.setDropdownCategories}
          selectedCategories={props.selectedCategories}
          setSelectedCategories={props.setSelectedCategories}
          maybeSelectedTtsModel={props.maybeSelectedTtsModel}
          setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
          />

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
              <button className="button is-danger is-large" disabled={remainingCharactersButtonDisabled}>Speak</button>
            </div>
            <div className="column has-text-centered">
              <button className="button is-danger is-light is-large" onClick={handleClearClick}>Clear</button>
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

function generateSyntheticCategories() : SyntheticCategory[] {
  return [
    // Under-categorized
    new SyntheticCategory('Under-categorized Models', 'syn:under'),
    new SyntheticCategory('With 0 categories', 'syn:uncategorized', 'syn:under'),
    new SyntheticCategory('With 1 category', 'syn:one-category', 'syn:under'),
    // Most recent
    new SyntheticCategory('Most Recent Voices', 'syn:most-recent'),
  ]
}

// Directly mutate the model records
function dynamicallyCategorizeModels(models: TtsModelListItem[]) {
  // NB: Sorting by creation date will involve more refactoring, so this is fine for now.
  const mostRecentModelTokens = new Set([...models].sort((modelA, modelB) => {
    const dateA = new Date(modelA.created_at);
    const dateB = new Date(modelB.created_at);
    if (dateA > dateB) {
      return -1;
    } else if (dateA < dateB) {
      return 1;
    } else {
      return 0;
    }
  }).map(model => model.model_token).slice(0, 25));

  models.forEach(model => {
    if (!model.category_tokens) {
      model.category_tokens = [];
    }
    if (model.category_tokens.length === 1) {
      model.category_tokens.push('syn:one-category');
    } else if (model.category_tokens.length === 0) {
      model.category_tokens.push('syn:uncategorized');
    }

    if (mostRecentModelTokens.has(model.model_token)) {
      model.category_tokens.push('syn:most-recent');
    }
  })
}

export { TtsModelListFc };
