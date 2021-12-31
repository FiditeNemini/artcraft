import React, { useState } from 'react';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useHistory, Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { CreateCategory, CreateCategoryIsError, CreateCategoryRequest } from '../../api/category/CreateCategory';
import { CreateSessionIsSuccess } from '../../api/user/CreateSession';

const DEFAULT_CAN_DIRECTLY_HAVE_MODELS = true;
const DEFAULT_CAN_HAVE_SUBCATEGORIES = false;
const DEFAULT_CAN_ONLY_MODS_APPLY = false;

interface Props {
  sessionWrapper: SessionWrapper,
}

interface TtsModelUploadJobResponsePayload {
  success: boolean,
  job_token?: string,
}

function CreateCategoryPage(props: Props) {
  let history = useHistory();

  // Request
  const [name, setName] = useState('');
  const [modelType, setModelType] = useState('tts');
  const [canDirectlyHaveModels, setCanDirectlyHaveModels] = useState(DEFAULT_CAN_DIRECTLY_HAVE_MODELS);
  const [canHaveSubcategories, setCanHaveSubcategories] = useState(DEFAULT_CAN_HAVE_SUBCATEGORIES);
  const [canOnlyModsApply, setCanOnlyModsApply] = useState(DEFAULT_CAN_ONLY_MODS_APPLY);

  // Auto generated
  const [idempotencyToken, setIdempotencyToken] = useState(uuidv4());

  // Errors
  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined);

  if (!props.sessionWrapper.isLoggedIn()) {
    return <div>You need to create an account or sign in.</div>
  }

  const maybeRecalculateIdempotencyToken = <T, >(before: T, after: T) => {
    if (before === after) return;
    setIdempotencyToken(uuidv4());
  }

  const handleNameChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const newName = (ev.target as HTMLInputElement).value;
    maybeRecalculateIdempotencyToken(name, newName);
    setName(newName);
  }

  const handleModelTypeChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    const newModelType = (ev.target as HTMLSelectElement).value;
    maybeRecalculateIdempotencyToken(modelType, newModelType);
    setModelType(newModelType);
  }

  const handleCanDirectlyHaveModelsChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const newCanDirectlyHaveModels = (ev.target as HTMLInputElement).checked;
    maybeRecalculateIdempotencyToken(canDirectlyHaveModels, newCanDirectlyHaveModels);
    setCanDirectlyHaveModels(newCanDirectlyHaveModels);
  }

  const handleCanHaveSubcategoriesChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const newCanHaveSubcategories = (ev.target as HTMLInputElement).checked;
    maybeRecalculateIdempotencyToken(canHaveSubcategories, newCanHaveSubcategories);
    setCanHaveSubcategories(newCanHaveSubcategories);
  }

  const handleCanOnlyModsApplyChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const newCanOnlyModsApply = (ev.target as HTMLInputElement).checked;
    maybeRecalculateIdempotencyToken(canOnlyModsApply, newCanOnlyModsApply);
    setCanOnlyModsApply(newCanOnlyModsApply);
  }

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) : Promise<boolean> => {
    ev.preventDefault();

    setErrorMessage(undefined);

    let request : CreateCategoryRequest = {
      name: name,
      model_type: modelType,
      idempotency_token: idempotencyToken,
      can_directly_have_models: undefined,
    }

    if (props.sessionWrapper.canEditCategories()) {
      // Moderator-only
      request.can_directly_have_models = canDirectlyHaveModels;
      request.can_have_subcategories = canHaveSubcategories;
      request.can_only_mods_apply = canOnlyModsApply;
    }

    const response = await CreateCategory(request);

    if (CreateCategoryIsError(response)) {
      setErrorMessage('there was an error with the request'); // TODO: Fix error serialization
    } else if (CreateSessionIsSuccess(response)) {
      history.push('/');
    }

    return false;
  }

  const isMod = props.sessionWrapper.canEditCategories();
  const categoryActionName = isMod ? "Create" : "Suggest";

  let errorFlash = <></>;

  if (!!errorMessage) {
    errorFlash = (
      <>
        <article className="message is-error">
          <div className="message-body">
            {errorMessage}
          </div>
        </article>
      </>
    );
  }

  let additionalModFields = <></>;

  if (isMod) {
    additionalModFields = (
      <>
        <div className="control">
          <label className="label">Moderator Options</label>

          <label className="checkbox">
            <input 
              type="checkbox"
              checked={canDirectlyHaveModels} 
              onChange={handleCanDirectlyHaveModelsChange} />
            &nbsp;Can this category be assigned to models? (If not, it's a super category.)
          </label>

          <br />

          <label className="checkbox">
            <input 
              type="checkbox"
              checked={canHaveSubcategories} 
              onChange={handleCanHaveSubcategoriesChange} />
            &nbsp;Can this category have subcategories?
          </label>

          <br />

          <label className="checkbox">
            <input 
              type="checkbox"
              checked={canOnlyModsApply} 
              onChange={handleCanOnlyModsApplyChange} />
            &nbsp;Can only mods apply this category?
          </label>
        </div>
      </>
    )
  }

  return (
    <div>
      <h1 className="title is-1"> {categoryActionName} Category </h1>

      {errorFlash}

      <form onSubmit={handleFormSubmit}>

        <div className="field">
          <label className="label">Category Name</label>
          <div className="control">
            <input className="input" type="text" placeholder="Category Name" value={name} onChange={handleNameChange} />
          </div>
        </div>

        <div className="field">
          <label className="label">Category Type</label>
          <div className="control">
            <div className="select is-info">
              <select onChange={handleModelTypeChange}>
                <option value="tts">TTS voice</option>
                <option value="w2l">W2L video</option>
              </select>
            </div>
          </div>
        </div>

        {additionalModFields}

        <br />

        <button className="button is-link is-large is-fullwidth"> {categoryActionName} </button>
      </form>

      <br />

      <Link
        to="/upload"
        className="button is-link is-fullwidth is-outlined"
        onClick={() => {}}
        >&lt; Back to contribute</Link>

      <br />
    </div>
  )
}

export { CreateCategoryPage };
