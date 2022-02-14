import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '@storyteller/components';
import { EnqueueJobResponsePayload } from '../tts_model_list/TtsModelListFc';
import { SessionTtsInferenceResultListFc } from '../../_common/SessionTtsInferenceResultsListFc';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { TtsInferenceJob } from '@storyteller/components/src/jobs/TtsInferenceJobs';
import { useParams, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { HiddenIconFc } from '../../_icons/HiddenIcon';
import { VisibleIconFc } from '../../_icons/VisibleIcon';
import { GetTtsModel, GetTtsModelIsErr, GetTtsModelIsOk, TtsModel, TtsModelLookupError } from '@storyteller/components/src/api/tts/GetTtsModel';
import { GravatarFc } from '../../_common/GravatarFc';
import { GetTtsModelUseCount } from '../../../api/tts/GetTtsModelUseCount';
import { BackLink } from '../../_common/BackLink';
import { ListTtsCategoriesForModel, ListTtsCategoriesForModelIsError, ListTtsCategoriesForModelIsOk, TtsModelCategory } from '../../../api/category/ListTtsCategoriesForModel';
import { ListTtsCategories, ListTtsCategoriesIsError, ListTtsCategoriesIsOk, TtsCategory } from '../../../api/category/ListTtsCategories';
import { CategoryBreadcrumb } from '../../_common/CategoryBreadcrumb';

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueTtsJob: (jobToken: string) => void,
  ttsInferenceJobs: Array<TtsInferenceJob>,
  textBuffer: string,
  setTextBuffer: (textBuffer: string) => void,
  clearTextBuffer: () => void,
}

function TtsModelViewFc(props: Props) {
  let { token } = useParams() as { token : string };

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [ttsModelUseCount, setTtsModelUseCount] = useState<number|undefined>(undefined);
  const [assignedCategories, setAssignedCategories] = useState<TtsModelCategory[]>([]);

  const [assignedCategoriesByTokenMap, setAssignedCategoriesByTokenMap] = useState<Map<string, TtsModelCategory>>(new Map());
  const [allCategoriesByTokenMap, setAllCategoriesByTokenMap] = useState<Map<string, TtsCategory>>(new Map());

  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  const getModel = useCallback(async (token) => {
    const model = await GetTtsModel(token);

    if (GetTtsModelIsOk(model)) {
      setTtsModel(model);
    } else if (GetTtsModelIsErr(model))  {
      switch(model) {
        case TtsModelLookupError.NotFound:
          setNotFoundState(true);
          break;
      }
    }
  }, []);

  const getModelUseCount = useCallback(async (token) => {
    const useCount = await GetTtsModelUseCount(token);
    setTtsModelUseCount(useCount)
  }, []);

  const listTtsCategoriesForModel = useCallback(async (token) => {
    const categoryList = await ListTtsCategoriesForModel(token);
    if (ListTtsCategoriesForModelIsOk(categoryList)) {
      setAssignedCategories(categoryList.categories);

      let categoriesByTokenMap = new Map();

      categoryList.categories.forEach(category => {
        categoriesByTokenMap.set(category.category_token, category);
      })

      setAssignedCategoriesByTokenMap(categoriesByTokenMap);

    } else if (ListTtsCategoriesForModelIsError(categoryList))  {
      // TODO: Surface error.
    }
  }, []);
  
  // TODO: Cache globally? Shouldn't change much.
  const listAllTtsCategories = useCallback(async () => {
    const categoryList = await ListTtsCategories();
    if (ListTtsCategoriesIsOk(categoryList)) {

      let categoriesByTokenMap = new Map();

      categoryList.categories.forEach(category => {
        categoriesByTokenMap.set(category.category_token, category);
      })

      setAllCategoriesByTokenMap(categoriesByTokenMap);

    } else if (ListTtsCategoriesIsError(categoryList))  {
      // Ignore.
    }
  }, []);

  useEffect(() => {
    getModel(token);
    getModelUseCount(token);
    listTtsCategoriesForModel(token);
    listAllTtsCategories();
  }, [token, getModel, getModelUseCount, listTtsCategoriesForModel, listAllTtsCategories]);

  if (notFoundState) {
    return (
      <h1 className="title is-1">Model not found</h1>
    );
  }

  if (!ttsModel) {
    return <div />
  }

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => { 
    const textValue = (ev.target as HTMLTextAreaElement).value;
    props.setTextBuffer(textValue);
  };

  const handleClearClick = (ev: React.FormEvent<HTMLButtonElement>) => { 
    ev.preventDefault();
    props.clearTextBuffer();
    return false;
  };

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (ttsModel === undefined) {
      return false;
    }

    if (props.textBuffer === undefined) {
      return false;
    }

    const modelToken = ttsModel!.model_token;

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

  let creatorLink = <span />;

  if (!!ttsModel?.creator_display_name) {
    const creatorUrl = FrontendUrlConfig.userProfilePage(ttsModel?.creator_username);
    creatorLink = (
      <span>
        <GravatarFc
          size={15}
          username={ttsModel.creator_display_name || ""} 
          email_hash={ttsModel.creator_gravatar_hash || ""} 
          />
        &nbsp;
        <Link to={creatorUrl}>{ttsModel.creator_display_name}</Link>
      </span>
    );
  }

  let title = 'TTS Model'
  if (ttsModel?.title !== undefined) {
      title = `${ttsModel.title} model`;
  }

  let humanUseCount : string | number = 'Fetching...';

  if (ttsModelUseCount !== undefined && ttsModelUseCount !== null) {
    humanUseCount = ttsModelUseCount;
  }

  let moderatorRows = null;

  if (props.sessionWrapper.canDeleteOtherUsersTtsResults() || props.sessionWrapper.canDeleteOtherUsersTtsModels()) {
    moderatorRows = (
      <>
        <tr>
          <td colSpan={2}>
            <br />
            <h4 className="subtitle is-4"> Moderator Details </h4>
          </td>
        </tr>
        <tr>
          <th>Creator is banned</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_is_banned ? "banned" : "good standing" }</td>
        </tr>
        <tr>
          <th>Creation IP address</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_ip_address_creation || "server error"}</td>
        </tr>
        <tr>
          <th>Update IP address</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_ip_address_last_update || "server error"}</td>
        </tr>
        <tr>
          <th>Mod deleted at (UTC)</th>
          <td>{ttsModel?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User deleted at (UTC)</th>
          <td>{ttsModel?.maybe_moderator_fields?.user_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>Is Front Page Featured?</th>
          <td>{ttsModel?.is_front_page_featured ? "yes" : "no"}</td>
        </tr>
        <tr>
          <th>Is Twitch Featured?</th>
          <td>{ttsModel?.is_twitch_featured ? "yes" : "no" }</td>
        </tr>
      </>
    );
  }

  let canEditModel = props.sessionWrapper.canEditTtsModelByUserToken(ttsModel?.creator_user_token);

  let editModelButton = <span />;

  if (canEditModel) {
    editModelButton = (
      <>
        <br />
        <Link 
          className={"button is-large is-info is-fullwidth"}
          to={FrontendUrlConfig.ttsModelEditPage(token)}
          >Edit Model Details</Link>
      </>
    );
  }

  let deleteModelButton = <span />;

  if (props.sessionWrapper.canDeleteTtsModelByUserToken(ttsModel?.creator_user_token)) {

    const currentlyDeleted = !!ttsModel?.maybe_moderator_fields?.mod_deleted_at || 
        !!ttsModel?.maybe_moderator_fields?.user_deleted_at;

    const deleteButtonTitle = currentlyDeleted ? "Undelete Model?" : "Delete Model?";

    const deleteButtonCss = currentlyDeleted ? 
      "button is-warning is-large is-fullwidth" :
      "button is-danger is-large is-fullwidth";

    deleteModelButton = (
      <>
        <br />
        <Link 
          className={deleteButtonCss}
          to={FrontendUrlConfig.ttsModelDeletePage(token)}
          >{deleteButtonTitle}</Link>
      </>
    );
  }

  let modelDescription = null;

  if (!!ttsModel?.description_rendered_html) {
    modelDescription = (
      <>
        <h4 className="title is-4"> Model Description </h4>
        <div 
          className="profile content is-medium" 
          dangerouslySetInnerHTML={{__html: ttsModel?.description_rendered_html || ""}}
          />
      </>
    );
  }

  const isCategoryModerator = props.sessionWrapper.canEditCategories();

  const showCategorySection = canEditModel || assignedCategories.length !== 0;
  let modelCategoriesSection = <></>;

  if (showCategorySection) {
    let modelCategories = null;

    if (assignedCategories.length !== 0) {
      modelCategories = (
        <>
          <div className="content">
            <ul>
            {assignedCategories.map(category => {
              const categoryHierarchy = recursiveBuildHierarchy(
                  allCategoriesByTokenMap, 
                  assignedCategoriesByTokenMap,
                  category.category_token);

              return (
                <>
                  <li>
                    <CategoryBreadcrumb categoryHierarchy={categoryHierarchy} isCategoryMod={isCategoryModerator} leafHasModels={true} />
                  </li>
                </>
              );
            })}
            </ul>
          </div>
        </>
      );
    }

    let editModelCategoriesButton = null;

    if (canEditModel) {
      editModelCategoriesButton = (
        <>
          <Link 
            className={"button is-large is-info is-fullwidth"}
            to={FrontendUrlConfig.ttsModelEditCategoriesPage(token)}
            >Edit Model Categories</Link>
        </>
      );
    }

    modelCategoriesSection = (
      <>
        <h4 className="title is-4"> Model Categories </h4>
        {modelCategories}
        {editModelCategoriesButton}
        <br />
      </>
    );
  }

  const resultVisibility = ttsModel?.creator_set_visibility === 'hidden' ? 
    <span>Hidden <HiddenIconFc /></span> :
    <span>Public <VisibleIconFc /></span> ;

  let defaultVocoder = 'not set (defaults to HiFi-GAN)';
  switch (ttsModel?.maybe_default_pretrained_vocoder) {
    case 'hifigan-superres':
      defaultVocoder = 'HiFi-GAN'
      break;
    case 'waveglow':
      defaultVocoder = 'WaveGlow'
      break;
  }

  return (
    <div className="content">
      <h1 className="title is-1"> {title} </h1>
      
      <p>
        <BackLink link="/" text="Back to all models" />
      </p>
      
      {modelDescription}

      {modelCategoriesSection}

      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <td colSpan={2}>
              <h4 className="subtitle is-4"> Model Details </h4>
            </td>
          </tr>
          <tr>
            <th>Creator</th>
            <td>
              {creatorLink}
            </td>
          </tr>
          <tr>
            <th>Use count</th>
            <td>{humanUseCount}</td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{ttsModel?.title}</td>
          </tr>
          <tr>
            <th>Model type</th>
            <td>{ttsModel?.tts_model_type}</td>
          </tr>
          <tr>
            <th>Default vocoder</th>
            <td>{defaultVocoder}</td>
          </tr>
          <tr>
            <th>Text preprocessing algorithm</th>
            <td>{ttsModel?.text_preprocessing_algorithm}</td>
          </tr>
          <tr>
            <th>Upload date (UTC)</th>
            <td>{ttsModel?.created_at}</td>
          </tr>
          <tr>
            <th>Visibility</th>
            <td>{resultVisibility}</td>
          </tr>

          {moderatorRows}

        </tbody>
      </table>

      {editModelButton}

      {deleteModelButton}

      <br />

      <h4 className="title is-4"> Use Model </h4>

      <form onSubmit={handleFormSubmit}>
        <textarea 
            onChange={handleChangeText}
            value={props.textBuffer}
            className="textarea is-large" 
            placeholder="Textual shenanigans go here..."></textarea>

        <div className="button-group">
          <div className="columns is-mobile">
            <div className="column has-text-centered">
              <button className="button is-info is-large" >Speak</button>
            </div>
            <div className="column has-text-centered">
              <button className="button is-info is-light is-large" onClick={handleClearClick}>Clear</button>
            </div>
          </div>
        </div>
      </form>

      <br />
      
      <SessionTtsInferenceResultListFc ttsInferenceJobs={props.ttsInferenceJobs} />

      <br />
      <BackLink link="/" text="Back to all models" />
    </div>
  )
}

// FIXME: This has been implemented three times, slightly differently
function recursiveBuildHierarchy(
  categoryByTokenMap: Map<string, TtsCategory>, 
  assignedCategoryByTokenMap: Map<string, TtsModelCategory>, 
  currentToken: string
): (TtsCategory|TtsModelCategory)[] {
  // NB: Using both maps should catch assigned categories that aren't public/approved.
  let found : TtsCategory | TtsModelCategory | undefined = assignedCategoryByTokenMap.get(currentToken);
  if (found === undefined) {
    found = categoryByTokenMap.get(currentToken);
  }
  if (found === undefined) {
    return [];
  }
  if (found.maybe_super_category_token === undefined) {
    return [found];
  }
  return [...recursiveBuildHierarchy(
    categoryByTokenMap, assignedCategoryByTokenMap, found.maybe_super_category_token), found];
}

export { TtsModelViewFc };
