import React, { useState, useEffect, useCallback } from 'react';
import { AssignTtsCategory, AssignTtsCategoryIsError, AssignTtsCategoryIsOk } from '../../../api/category/AssignTtsCategory';
import { BackLink } from '../../_common/BackLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { GetTtsModel, GetTtsModelIsErr, GetTtsModelIsOk, TtsModel, TtsModelLookupError } from '../../../api/tts/GetTtsModel';
import { ListTtsCategories, ListTtsCategoriesIsError, ListTtsCategoriesIsOk, TtsCategory } from '../../../api/category/ListTtsCategories';
import { ListTtsCategoriesForModel, ListTtsCategoriesForModelIsError, ListTtsCategoriesForModelIsOk, TtsModelCategory } from '../../../api/category/ListTtsCategoriesForModel';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { faMinusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsEditCategoriesPage(props: Props) {
  let { token } = useParams() as { token : string };

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  const [allTtsCategories, setAllTtsCategories] = useState<TtsCategory[]>([]);
  const [assignedCategories, setAssignedCategories] = useState<TtsModelCategory[]>([]);

  const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined); 

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

  const listTtsCategories = useCallback(async () => {
    const categoryList = await ListTtsCategories();

    if (ListTtsCategoriesIsOk(categoryList)) {
      setAllTtsCategories(categoryList.categories);
    } else if (ListTtsCategoriesIsError(categoryList))  {
      setErrorMessage("error listing all categories");
    }
  }, []);

  const listTtsCategoriesForModel = useCallback(async (token) => {
    const categoryList = await ListTtsCategoriesForModel(token);

    if (ListTtsCategoriesForModelIsOk(categoryList)) {
      setAssignedCategories(categoryList.categories);
    } else if (ListTtsCategoriesForModelIsError(categoryList))  {
      setErrorMessage("error listing categories for model");
    }
  }, []);

  useEffect(() => {
    getModel(token);
    listTtsCategories();
    listTtsCategoriesForModel(token);
  }, [token, getModel, listTtsCategories, listTtsCategoriesForModel]);


  if (notFoundState) {
    return (
      <h1 className="title is-1">Model not found</h1>
    );
  }

  if (!ttsModel) {
    return <div />
  }

  const assignCategory = async (categoryToken: string, assign: boolean) => {
    if (categoryToken === '') {
      return; // Default dropdown option is a no-op
    }

    const assignRequest = {
      category_token: categoryToken,
      tts_model_token: token,
      assign: assign,
    };

    const result = await AssignTtsCategory(assignRequest);

    if (AssignTtsCategoryIsOk(result)) {
      setErrorMessage(undefined);
      listTtsCategoriesForModel(token); // Reload
    } else if (AssignTtsCategoryIsError(result))  {
      const action = assign ? "adding" : "removing";
      setErrorMessage(`error ${action} category`);
    }
  }

  const handleAddCategory = async (ev: React.FormEvent<HTMLSelectElement>) => {
    const categoryToken = (ev.target as HTMLSelectElement).value;
    await assignCategory(categoryToken, true);
  }

  const handleRemoveCategory = async (categoryToken: string) => {
    await assignCategory(categoryToken, false);
  }

  const modelLink = FrontendUrlConfig.ttsModelPage(token);

  const assignedCategoryTokens = 
      new Set<string>(assignedCategories.map(category => category.category_token));

  let currentCategoriesList = (
    <>
      <p>No categories yet...</p>
    </>
  );

  if (assignedCategories.length !== 0) {
    currentCategoriesList = (
      <>
        {assignedCategories.map(category => {
          return (
            <li>
              <span className="content is-medium">{category.name}</span>
                &nbsp;
                <button 
                  className="button is-rounded is-danger is-small is-light"
                  onClick={() => handleRemoveCategory(category.category_token)}
                >
                  remove&nbsp;
                  <FontAwesomeIcon icon={faTimes} />
                </button>
            </li>
          );
        })}
      </>
    );
  }

  const addCategoryOptions = allTtsCategories.filter(category => {
    return !(assignedCategoryTokens.has(category.category_token));
  }).map(category => {
    return (
      <>
        <option value={category.category_token}>{category.name}</option>
      </>
    )
  });

  let errorFlash = <></>;

  if (!!errorMessage) {
    errorFlash = (
      <>
        <article className="message is-danger">
          <div className="message-body">
            {errorMessage}
          </div>
        </article>
      </>
    );
  }

  return (
    <div className="content">
      <h1 className="title is-1">Edit Categories</h1>
      <h4 className="subtitle is-4"> TTS Model: {ttsModel.title} </h4>

      {errorFlash}

      <p>
        <BackLink link={modelLink} text="Back to model" />
      </p>

      <h3 className="is-3"> Current categories </h3>
      <ul>{currentCategoriesList}</ul>

      <h3 className="is-3"> Add new category </h3>
      
      <div className="field">
        <div className="control">
          <div className="select is-info">
            <select onChange={handleAddCategory}>
              <option value="">Select category to add...</option>
              {addCategoryOptions}
            </select>
          </div>
        </div>
      </div>

      <br />

      <p>
        <BackLink link={modelLink} text="Back to model" />
      </p>

    </div>
  )
}

export { TtsEditCategoriesPage };
