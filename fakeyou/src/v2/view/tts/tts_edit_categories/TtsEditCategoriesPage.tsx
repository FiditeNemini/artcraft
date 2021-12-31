import React, { useState, useEffect, useCallback } from 'react';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams, useHistory } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { BackLink } from '../../_common/BackLink';
import { GetTtsModel, GetTtsModelIsErr, GetTtsModelIsOk, TtsModel, TtsModelLookupError } from '../../../api/tts/GetTtsModel';
import { ListCategoriesForTtsModel, ListCategoriesForTtsModelIsError, ListCategoriesForTtsModelIsOk, TtsModelCategory } from '../../../api/category/ListCategoriesForTtsModel';

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsEditCategoriesPage(props: Props) {
  let { token } = useParams() as { token : string };

  const history = useHistory();

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

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

  const listCategoriesForModel = useCallback(async (token) => {
    const categoryList = await ListCategoriesForTtsModel(token);

    if (ListCategoriesForTtsModelIsOk(categoryList)) {
      setAssignedCategories(categoryList.categories);
    } else if (ListCategoriesForTtsModelIsError(categoryList))  {
      // TODO: Improve
    }
  }, []);

  useEffect(() => {
    getModel(token);
    listCategoriesForModel(token);
  }, [token, getModel]);


  if (notFoundState) {
    return (
      <h1 className="title is-1">Model not found</h1>
    );
  }

  if (!ttsModel) {
    return <div />
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

      <p>
        <BackLink link={modelLink} text="Back to model" />
      </p>

    </div>
  )
}

export { TtsEditCategoriesPage };
