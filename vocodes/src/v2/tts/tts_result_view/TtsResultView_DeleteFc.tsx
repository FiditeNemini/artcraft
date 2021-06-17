import React from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useHistory } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
  resultToken: string,
  maybeCreatorUserToken: string | undefined | null,
  currentlyDeleted: boolean,
}

function TtsResultViewDeleteFc(props: Props) {
  const history = useHistory();

  const handleDeleteFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.deleteTtsInferenceResult(props.resultToken);

    const request = {
      set_delete: !props.currentlyDeleted,
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
      if (res.success) {
        if (props.sessionWrapper.canDeleteOtherUsersTtsResults()) {
          history.go(0); // force reload
        } else {
          history.push('/');
        }
      }
    })
    .catch(e => {
    });
    return false;
  }

  if (!props.sessionWrapper.canDeleteTtsResultByUserToken(props.maybeCreatorUserToken)) {
    return <span />;
  }

  const buttonTitle = props.currentlyDeleted ? "Undelete" : "Delete";

  const buttonCss = props.currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  const formLabel = props.currentlyDeleted ? 
     "Recover the TTS Result (makes it visible again)" : 
     "Delete TTS Result (hides from everyone but mods)";

  return (
    <form onSubmit={handleDeleteFormSubmit}>
      
      <br />
      <label className="label">{formLabel}</label>

      <p className="control">
        <button className={buttonCss}>
          {buttonTitle}
        </button>
      </p>

    </form>
  )
}

export { TtsResultViewDeleteFc };
