import React from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { SessionWrapper } from '../../session/SessionWrapper';
import { useHistory } from 'react-router-dom';

interface Props {
  sessionWrapper: SessionWrapper,
  templateSlug: string,
  currentlyDeleted: boolean,
}

function W2lTemplateViewDeleteFc(props: Props) {
  const history = useHistory();

  const handleDeleteFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.deleteW2l(props.templateSlug);

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
        history.go(0); // force reload
      }
    })
    .catch(e => {
    });
    return false;
  }

  if (!props.sessionWrapper.canDeleteOtherUsersW2lTemplates()) {
    return <span />;
  }

  const buttonTitle = props.currentlyDeleted ? "Undelete" : "Delete";
  const formLabel = props.currentlyDeleted ? 
     "Recover the W2L Template (makes it visible and usable again)" : 
     "Delete W2L Template (hides from everyone but mods)";
  const buttonCss = props.currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

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

export { W2lTemplateViewDeleteFc };
