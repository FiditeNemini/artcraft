import React, { useState, useEffect, useCallback } from 'react';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams, useHistory } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { BackLink } from '../../_common/BackLink';
import { GetTtsModel, GetTtsModelIsErr, GetTtsModelIsOk, TtsModel, TtsModelLookupError } from '../../../api/tts/GetTtsModel';

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsEditCategoriesPage(props: Props) {
  let { token } = useParams() as { token : string };

  const history = useHistory();

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
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

  useEffect(() => {
    getModel(token);
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

  return (
    <div className="content">
      <h1 className="title is-1"> Edit TTS Categories </h1>

      <p>
        <BackLink link={modelLink} text="Back to model" />
      </p>

      <p>
        Model: {ttsModel.title}
      </p>
    </div>
  )
}

export { TtsEditCategoriesPage };
