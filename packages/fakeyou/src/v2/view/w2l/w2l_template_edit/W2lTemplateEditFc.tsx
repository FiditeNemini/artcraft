import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '@storyteller/components';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams, useHistory } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { VisibleIconFc } from '../../_icons/VisibleIcon';
import { HiddenIconFc } from '../../_icons/HiddenIcon';
import { GetW2lTemplate, GetW2lTemplateIsOk, W2lTemplate } from '../../../api/w2l/GetW2lTemplate';
import { BackLink } from '../../_common/BackLink';

const DEFAULT_VISIBILITY = 'public';

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lTemplateEditFc(props: Props) {
  let { templateToken } : { templateToken : string } = useParams();

  const history = useHistory();

  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState<string>("");
  const [visibility, setVisibility] = useState<string>(DEFAULT_VISIBILITY);

  const getTemplate = useCallback(async (token) => {
    const template = await GetW2lTemplate(token);

    if (GetW2lTemplateIsOk(template)) {
      setTitle(template.title || "")
      setDescriptionMarkdown(template.description_markdown || "")
      setVisibility(template.creator_set_visibility || DEFAULT_VISIBILITY);
      setW2lTemplate(template)
    }

  }, []);


  useEffect(() => {
    getTemplate(templateToken);
  }, [templateToken, getTemplate]);

  const handleTitleChange = (ev: React.FormEvent<HTMLInputElement>) => { 
    ev.preventDefault();
    const textValue = (ev.target as HTMLInputElement).value;
    setTitle(textValue);
    return false;
  };

  const handleDescriptionMarkdownChange = (ev: React.FormEvent<HTMLTextAreaElement>) => { 
    ev.preventDefault();
    const textValue = (ev.target as HTMLTextAreaElement).value;
    setDescriptionMarkdown(textValue);
    return false;
  };

  const handleVisibilityChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setVisibility((ev.target as HTMLSelectElement).value)
  };

  const templateLink = FrontendUrlConfig.w2lTemplatePage(templateToken);

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (w2lTemplate === undefined) {
      return false;
    }

    if (title.trim() === "") {
      return false;
    }

    const templateToken = w2lTemplate!.template_token;

    const endpointUrl = new ApiConfig().editW2lTemplate(templateToken);
    
    const request = {
      title: title,
      description_markdown: descriptionMarkdown,
      creator_set_visibility: visibility || DEFAULT_VISIBILITY,
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
      if (res === undefined ||
        !res.success) {
        return; // Endpoint error?
      }

      history.push(templateLink);
    })
    .catch(e => {
    });

    return false;
  };

  let isDisabled = w2lTemplate === undefined;

  const visibilityIcon = (visibility === 'public') ? <VisibleIconFc /> : <HiddenIconFc />;

  return (
    <div className="content">
      <h1 className="title is-1"> Edit Template </h1>

      <p>
        <BackLink link={templateLink} text="Back to template" />
      </p>

      <form onSubmit={handleFormSubmit}>
        <fieldset disabled={isDisabled}>

          <div className="field">
            <label className="label">Template title</label>
            <div className="control has-icons-left has-icons-right">
              <input 
                onChange={handleTitleChange}
                className="input" 
                type="text" 
                placeholder="Template title" 
                value={title}
                />
            </div>
            {/*<p className="help">{invalidReason}</p>*/}
          </div>

          <div className="field">
            <label className="label">Description (supports Markdown)</label>
            <div className="control">
              <textarea 
                onChange={handleDescriptionMarkdownChange}
                className="textarea is-large" 
                placeholder="Model description (ie. source of data, training duration, etc)"
                value={descriptionMarkdown} 
                />
            </div>
          </div>

          <div className="field">
            <label className="label">
              Template Visibility&nbsp;{visibilityIcon}
            </label>
            <div className="control select">
              <select 
                name="creator_set_visibility" 
                onChange={handleVisibilityChange}
                value={visibility}
                >
                <option value="public">Public (visible from your profile)</option>
                <option value="hidden">Unlisted (shareable URLs)</option>
              </select>
            </div>
          </div>

          <br />

          <button className="button is-link is-large is-fullwidth">Update Template</button>

        </fieldset>
      </form>
      
    </div>
  )
}

export { W2lTemplateEditFc };
