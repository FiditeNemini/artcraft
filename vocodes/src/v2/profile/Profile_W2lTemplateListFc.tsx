import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../common/ApiConfig';
import { Link } from "react-router-dom";
import { getRandomInt } from '../../v1/api/Utils';

interface W2lTemplateListResponsePayload {
  success: boolean,
  templates: Array<W2lTemplate>,
}

interface W2lTemplate {
  template_token: string,
  template_type: string,
  creator_user_token: string,
  username: string,
  display_name: string,
  title: string,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  maybe_image_object_name: string,
  maybe_video_object_name: string,
  created_at: string,
  updated_at: string,
}

interface Props {
  username: string,
}

function ProfileW2lTemplateListFc(props: Props) {
  const [w2lTemplates, setW2lTemplates] = useState<Array<W2lTemplate>>([]);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listW2lTemplatesForUser(props.username);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : W2lTemplateListResponsePayload  = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lTemplates(templatesResponse.templates)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [props.username]); // NB: Empty array dependency sets to run ONLY on mount

  
  let templateElements : Array<JSX.Element> = [];

  w2lTemplates.forEach(t => {
    let object = null;
    
    if (t.maybe_image_object_name !== undefined && t.maybe_image_object_name !== null) {
      object = t.maybe_image_object_name;
    } else if (t.maybe_video_object_name !== undefined && t.maybe_video_object_name !== null) {
      object = t.maybe_video_object_name;
    } else {
      console.warn(`No image for template ${t.template_token}`);
      return;
    }

    let url = `https://storage.googleapis.com/dev-vocodes-public${object}`;

    let link = `/w2l/${t.template_token}`;
  
    templateElements.push((
      <div className="tile is-parent" key={t.template_token}>
        <article className="tile is-child box">
          {/*<p className="title">One</p>*/}
          <Link to={link}><img src={url} alt="" /></Link>
        </article>
      </div>
    ));
  });

  let allRowsOfTemplateElements : Array<JSX.Element> = [];
  let rowOfTemplateElements : Array<JSX.Element> = [];

  let nextRowSize = getRandomInt(3, 4);

  // NB: To prevent React spamming about children having unique key props
  let rowKey = "row0";
  let rowIndex = 0;

  templateElements.forEach(el => {
    rowOfTemplateElements.push(el);

    if (rowOfTemplateElements.length === nextRowSize) {
      allRowsOfTemplateElements.push(
        <div className="tile is-ancestor" key={rowKey}>
          {rowOfTemplateElements.map(el => el)}
        </div>
      );
      rowOfTemplateElements = [];
      rowIndex += 1;
      rowKey = `row${rowIndex}`;

      // Don't have the same number on each row.
      let lastRowSize = nextRowSize;
      while (lastRowSize === nextRowSize) {
        nextRowSize = getRandomInt(3, 6);
      }
    }
  });

  // Make sure last row is built.
  if (rowOfTemplateElements.length !== 0) {
    allRowsOfTemplateElements.push(
      <div className="tile is-ancestor" key={rowKey}>
        {rowOfTemplateElements.map(el => el)}
      </div>
    );
    rowOfTemplateElements = [];
  }

  return (
    <div>
      {allRowsOfTemplateElements.map(el => el)}
    </div>
  )
}

export { ProfileW2lTemplateListFc };
