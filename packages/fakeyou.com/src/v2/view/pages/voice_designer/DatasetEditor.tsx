import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import { faPencil, faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { TempInput, Panel, SegmentButtons, TempSelect } from "components/common";
import useVoiceRequests from "./useVoiceRequests";

// import { v4 as uuidv4 } from "uuid";

import "./VoiceDesigner.scss";

interface Props {
  value?: any;
}

interface RouteParams {
  dataset_token?: string;
}

export default function DatasetEditor({ value }: Props) {
  const { datasets, inputCtrl } = useVoiceRequests({});
  const [title, titleSet] = useState("");
  const [language,languageSet] = useState("en");
  const [visibility,visibilitySet] = useState("");
  const [ready,readySet] = useState(false);
  // const inputCtrl = (todo: any) => ({ target }: { target: any}) => todo(target.value);
  const { dataset_token: token } = useParams<RouteParams>();
  const pageTitle = token ? `Edit` : "Create Dataset";
  const subText = token ?
    "Edit your dataset by uploading more samples to create a new voice" :
    "Add voice details and upload audio samples to clone your voice!";
  const titleIcon = token ? faPencil : faWaveform;
  const back = {
    label: "Back to Voice Designer",
    to: `/voice-designer/${ token ? "datasets" : "voices" }`
  };
  const options = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  const visibilityOptions = [{ label: "Public", value: "public" },{  label: "Hidden", value: "hidden" }];
  const buttonLabel = "Save dataset";
  const buttonOnClick = () => {
    if (token) {
      datasets.edit(token,{
        title,
        creator_set_visibility: visibility,
        ietf_language_tag: language
      });
    } 
    // else {
    //   datasets.create({
    //       title,
    //       creator_set_visibility: visibility,
    //       idempotency_token: uuidv4(),
    //   });
    // }
  };
  const headerProps = { back, buttonOnClick, buttonLabel, panel: false, showButton: true, subText, title: pageTitle, titleIcon };

  useEffect(() => {
    if (token && datasets.list && datasets.list.length && !ready) {
      const { creator_set_visibility, ietf_language_tag, title: resTitle } = datasets.byToken(token);
      readySet(true);
      titleSet(resTitle);
      languageSet(ietf_language_tag);
      visibilitySet(creator_set_visibility);
    }
  },[datasets,ready,token]);

  return <Container {...{ className: "voice-designer-page", type: "panel", }}>
  	<PageHeader {...headerProps}/>
    <Panel>
      <div className="p-3 py-4 p-md-4">
        <TempInput {...{ label: "Title", onChange: inputCtrl(titleSet), value: title }}/>
        <TempSelect {...{  label: "Language", name: "language", onChange: inputCtrl(languageSet), options, value: language }}/>
        <label {...{ className: "sub-title" }} htmlFor="">Visibility</label>
        <SegmentButtons {...{ value: visibility, options: visibilityOptions, onChange: inputCtrl(visibilitySet) }}/>
      </div>
    </Panel>
  </Container>;
};