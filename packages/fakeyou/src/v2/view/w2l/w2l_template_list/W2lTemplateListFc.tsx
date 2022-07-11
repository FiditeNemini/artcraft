import React, { useState, useEffect } from "react";
import { ApiConfig } from "@storyteller/components";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
//import { getRandomInt } from '../../../../v1/api/Utils';
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { distance, duration } from "../../../../data/animation";
import { USE_REFRESH } from "../../../../Refresh";

const Fade = require("react-reveal/Fade");

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
  sessionWrapper: SessionWrapper;
}

function W2lTemplateListFc(props: Props) {
  const [w2lTemplates, setW2lTemplates] = useState<Array<W2lTemplate>>([]);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listW2l();

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
  }, []); // NB: Empty array dependency sets to run ONLY on mount

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
      <div className="tile is-parent" key={t.template_token}>
        <article className="tile is-child box">
          <Link to={link}>
            <img src={url} alt="template" />
          </Link>
        </article>
      </div>
    );
  });

  let allRowsOfTemplateElements: Array<JSX.Element> = [];
  let rowOfTemplateElements: Array<JSX.Element> = [];

  // NB: To prevent React spamming about children having unique key props
  let rowKey = "row0";
  let rowIndex = 0;

  //let nextRowSize = getRandomInt(3, 4);
  let nextRowSize = 3;

  templateElements.forEach((el) => {
    rowOfTemplateElements.push(el);

    if (rowOfTemplateElements.length === nextRowSize) {
      allRowsOfTemplateElements.push(
        <div className="tile is-ancestor" key={rowKey}>
          {rowOfTemplateElements.map((el) => el)}
        </div>
      );
      rowOfTemplateElements = [];
      rowIndex += 1;
      rowKey = `row${rowIndex}`;

      // Don't have the same number on each row.
      //let lastRowSize = nextRowSize;
      //while (lastRowSize === nextRowSize) {
      //  nextRowSize = getRandomInt(2, 5);
      //}
    }
  });

  // Make sure last row is built.
  if (rowOfTemplateElements.length !== 0) {
    allRowsOfTemplateElements.push(
      <div className="tile is-ancestor" key={rowKey}>
        {rowOfTemplateElements.map((el) => el)}
      </div>
    );
    rowOfTemplateElements = [];
  }

  let extraDetails = <p />;

  if (props.sessionWrapper.isLoggedIn()) {
    extraDetails = (
      <p className="lead mb-4">
        Pick a template, then you can make it lip sync. If you want to use your
        own video or image, you can
        <Link to="/contribute">upload it as a template</Link>. You'll then be
        able to use it whenever you want!
      </p>
    );
  } else {
    extraDetails = (
      <p className="lead mb-4">
        Pick a template, then you can make it lip sync. If you want to use your
        own video or image, you'll need to{" "}
        <Link to="/signup">create an account</Link>. You'll then be able to
        upload and reuse your templates whenever you want!
      </p>
    );
  }

  if (!USE_REFRESH) {
    return (
      <div>
        <br />
        <h1 className="title is-1"> Video lip sync templates </h1>

        {extraDetails}

        <br />

        {allRowsOfTemplateElements.map(el => el)}

        <br />

        <p>This feature is based on Wav2Lip by by Prajwal, K R and Mukhopadhyay,
          Rudrabha and Namboodiri, Vinay P. and Jawahar, C.V.</p>

        <br />

      </div>
    );
  }

  return (
    <div>
      <Fade bottom cascade duration={duration} distance={distance}>
        <div className="container py-5">
          <div>
            <h1 className="display-5 fw-bold mb-3">Video Lip Sync Templates</h1>
          </div>
          <div>{extraDetails}</div>
        </div>
      </Fade>

      <div className="container">
        {allRowsOfTemplateElements.map((el) => el)}
      </div>

      <div className="container">
        <p>
          This feature is based on Wav2Lip by by Prajwal, K R and Mukhopadhyay,
          Rudrabha and Namboodiri, Vinay P. and Jawahar, C.V.
        </p>
      </div>

      <br />
    </div>
  );
}

export { W2lTemplateListFc };
