import React, { useState, useEffect, useCallback } from 'react';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams, useHistory } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { BackLink } from '../../_common/BackLink';
import { GetTtsModel, GetTtsModelIsErr, GetTtsModelIsOk, TtsModel, TtsModelLookupError } from '../../../api/tts/GetTtsModel';
import { ListTtsCategoriesForModel, ListTtsCategoriesForModelIsError, ListTtsCategoriesForModelIsOk, TtsModelCategory } from '../../../api/category/ListTtsCategoriesForModel';
import { ListTtsCategories, ListTtsCategoriesIsError, ListTtsCategoriesIsOk, TtsCategory } from '../../../api/category/ListTtsCategories';
import { AssignTtsCategory, AssignTtsCategoryIsError, AssignTtsCategoryIsOk } from '../../../api/category/AssignTtsCategory';

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsEditCategoriesPage(props: Props) {
  let { token } = useParams() as { token : string };

  const history = useHistory();

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  const [allTtsCategories, setAllTtsCategories] = useState<TtsCategory[]>([]);
  const [assignedCategories, setAssignedCategories] = useState<TtsModelCategory[]>([]);

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
      // TODO: Improve
    }
  }, []);

  const listTtsCategoriesForModel = useCallback(async (token) => {
    const categoryList = await ListTtsCategoriesForModel(token);

    if (ListTtsCategoriesForModelIsOk(categoryList)) {
      setAssignedCategories(categoryList.categories);
    } else if (ListTtsCategoriesForModelIsError(categoryList))  {
      // TODO: Improve
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

  const handleAddCategory = async (ev: React.FormEvent<HTMLSelectElement>) => {
    const categoryToken = (ev.target as HTMLSelectElement).value;

    if (categoryToken === '') {
      return; // Default dropdown option is a no-op
    }

    const assignRequest = {
      category_token: categoryToken,
      tts_model_token: token,
      assign: true,
    };

    const result = await AssignTtsCategory(assignRequest);

    if (AssignTtsCategoryIsOk(result)) {
      listTtsCategoriesForModel(token); // Reload
    } else if (AssignTtsCategoryIsError(result))  {
      // TODO: Improve
    }
  }

  const modelLink = FrontendUrlConfig.ttsModelPage(token);

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
              {category.name} [<a href="#">edit category</a>] [<a href="#">remove</a>]
            </li>
          );
        })}
      </>
    );
  }

  const addCategoryOptions = allTtsCategories.filter(category => {
    //if (category.category_token)
    return true;
  }).map(category => {
    return (
      <>
        <option value={category.category_token}>{category.name}</option>
      </>
    )
  });

  return (
    <div className="content">
      <h1 className="title is-1">Edit TTS Categories</h1>
      <h4 className="subtitle is-4"> Model: {ttsModel.title} </h4>

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

      <p>
        <BackLink link={modelLink} text="Back to model" />
      </p>

    </div>
  )
}

export { TtsEditCategoriesPage };
