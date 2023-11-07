import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
// import { Stepper } from "./components/Stepper";
// import { StepperControls } from "./components/StepperControls";
import { faPencil, faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { Input, Panel, Select } from "components/common";
import useVoiceRequests from "./useVoiceRequests";


import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface Props {
  value?: any;
  sessionWrapper: SessionWrapper;
}

interface RouteParams {
  dataset_token?: string;
}

export default function DatasetEditor({ sessionWrapper, value }: Props) {
  const { datasets, datasetByToken } = useVoiceRequests();
  const [title, titleSet] = useState("");
  const [language,languageSet] = useState({ value: "en", label: "English"});
  const [visibility,visibilitySet] = useState("");
  const [ready,readySet] = useState(false);
  // const [currentStep, currentStepSet] = useState(0);
  const { dataset_token: token } = useParams<RouteParams>();
  const pageTitle = token ? `Edit` : "Create Dataset";
  const subText = token ?
    "Edit your dataset by uploading more samples to create a new voice" :
    "Add voice details and upload audio samples to clone your voice!";
  const titleIcon = token ? faPencil : faWaveform;
  const back = {
    label: "Back to Voice Designer",
    to: token ? "/voice-designer/datasets" : "/voice-designer/voices"
  };
  // const steps = ["A","B"];

  useEffect(() => {
    if (token && datasets && datasets.length && !ready) {
      const { creator_set_visibility, ietf_language_tag, title: resTitle } = datasetByToken(token);
      console.log("☔️",ietf_language_tag);
      readySet(true);
      titleSet(resTitle);
      languageSet({ value: ietf_language_tag, label: "asss" });
      visibilitySet(creator_set_visibility);
    }
  },[datasetByToken,datasets,ready,token]);

  const inputCtrl = (todo: any) => ({ target }: { target: any}) => todo(target.value);

  const selectChange = ({ value }: any) => { // react-select doesn't format events like events, doesn't pass name prop, ew
    console.log("🍕",value);
    // languageSet(value);
  }

  const options = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  const [abc,abcSet] = useState("123");

      console.log("🚜", visibility, language, title);
  return <Container type="panel">
  	<PageHeader {...{ back, subText, title: pageTitle, titleIcon }} panel={false} />
      <Panel>
        <div className="p-3 py-4 p-md-4">
          <Input {...{ label: "Title", onChange: inputCtrl(titleSet), value: title }}/>
          <Select {...{  label: "Language", name: "language", onChange: selectChange, options, value: language }}/>
          <select {...{ name: 'abc', value: abc, onChange: (e:any) => console.log("🌸",e.target.value) }}>
            <option value="123">123</option>
            <option value="456">456</option>
            <option value="789">789</option>
          </select>
        </div>
      </Panel>
  </Container>;
};