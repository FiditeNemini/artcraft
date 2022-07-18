import React, { useState, useEffect } from "react";
import { ApiConfig } from "@storyteller/components";
import { Link } from "react-router-dom";
//import { getRandomInt } from '../../../../v1/api/Utils';
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";

interface W2lTemplateListResponsePayload {
  success: boolean;
  templates: Array<W2lTemplate>;
}

interface W2lTemplate {
  template_token: string;
  template_type: string;
  creator_user_token: string;
  username: string;
  display_name: string;
  title: string;
  frame_width: number;
  frame_height: number;
  duration_millis: number;
  maybe_image_object_name: string;
  maybe_video_object_name: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  username: string;
}

function ProfileW2lTemplateListFc(props: Props) {
  const [w2lTemplates, setW2lTemplates] = useState<Array<W2lTemplate>>([]);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listW2lTemplatesForUser(props.username);

    fetch(endpointUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        const templatesResponse: W2lTemplateListResponsePayload = res;
        if (!templatesResponse.success) {
          return;
        }

        setW2lTemplates(templatesResponse.templates);
      })
      .catch((e) => {
        //this.props.onSpeakErrorCallback();
      });
  }, [props.username]); // NB: Empty array dependency sets to run ONLY on mount

  let templateElements: Array<JSX.Element> = [];

  w2lTemplates.forEach((t) => {
    let object = null;

    if (
      t.maybe_image_object_name !== undefined &&
      t.maybe_image_object_name !== null
    ) {
      object = t.maybe_image_object_name;
    } else if (
      t.maybe_video_object_name !== undefined &&
      t.maybe_video_object_name !== null
    ) {
      object = t.maybe_video_object_name;
    } else {
      console.warn(`No image for template ${t.template_token}`);
      return;
    }

    let url = new BucketConfig().getGcsUrl(object);

    let link = `/w2l/${t.template_token}`;

    templateElements.push(
      <div className="video-card">
        <div className="video-card-body d-flex flex-column">
          <h6 className="video-card-title mb-1">Title</h6>
          <p className="video-card-text">by (name))</p>
        </div>
        <Link to={link}>
          <img className="video-img" src={url} alt="" />
        </Link>
      </div>
    );
  });

  let allRowsOfTemplateElements: Array<JSX.Element> = [];
  let rowOfTemplateElements: Array<JSX.Element> = [];

  //let nextRowSize = getRandomInt(3, 4);
  let nextRowSize = 1;

  // NB: To prevent React spamming about children having unique key props
  let rowKey = "row0";
  let rowIndex = 0;

  templateElements.forEach((el) => {
    rowOfTemplateElements.push(el);

    if (rowOfTemplateElements.length === nextRowSize) {
      allRowsOfTemplateElements.push(
        <div className="col-sm-6 col-md-4 col-lg-3 d-flex" key={rowKey}>
          {rowOfTemplateElements.map((el) => el)}
        </div>
      );
      rowOfTemplateElements = [];
      rowIndex += 1;
      rowKey = `row${rowIndex}`;

      // Don't have the same number on each row.
      //let lastRowSize = nextRowSize;
      //while (lastRowSize === nextRowSize) {
      //  nextRowSize = getRandomInt(3, 6);
      //}
    }
  });

  // Make sure last row is built.
  if (rowOfTemplateElements.length !== 0) {
    allRowsOfTemplateElements.push(
      <div className="col-sm-6 col-md-4 col-lg-3 d-flex" key={rowKey}>
        {rowOfTemplateElements.map((el) => el)}
      </div>
    );
    rowOfTemplateElements = [];
  }

  return (
    <div className="row gy-4">{allRowsOfTemplateElements.map((el) => el)}</div>
  );
}

export { ProfileW2lTemplateListFc };
