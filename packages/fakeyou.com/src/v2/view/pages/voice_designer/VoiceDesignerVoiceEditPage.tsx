import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  faEye,
  faLanguage,
  faWaveform,
} from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import TempInput from "components/common/TempInput";
import { Button, TempSelect } from "components/common";
import useVoiceRequests from "./useVoiceRequests";
import { useHistory } from "react-router-dom";

function VoiceDesignerVoiceEditPage() {
  const [language, languageSet] = useState("en");
  const [visibility, visibilitySet] = useState("");
  const [title, titleSet] = useState("");

  const [fetched,fetchedSet] = useState(false);

  const history = useHistory();
  const { voice_token } = useParams();

  const { inputCtrl, languages, visibilityOptions, voices } = useVoiceRequests({});

  usePrefixedDocumentTitle("Edit Voice");

  const onClick = () => voices.update(voice_token,{
    title,
    creator_set_visibility: visibility,
    ietf_language_tag: language,
  })
  .then((res: any) => {
    if (res && res.success) {
      history.push("/voice-designer");
    }
  });

  useEffect(() => {
    if (!fetched && voice_token) {
      fetchedSet(true);
      voices.get(voice_token,{})
      .then((res) => {
        languageSet(res.ietf_language_tag);
        titleSet(res.title);
        visibilitySet(res.creator_set_visibility);
      });
    }

  },[fetched, voice_token, voices]);

  return (
    <Container type="panel">
      <PageHeader
        title="Edit Voice"
        titleIcon={faWaveform}
        subText="Make changes to your voice details"
        panel={false}
        showBackButton={true}
        backbuttonLabel="Back to Voice Designer"
        backbuttonTo="/voice-designer"
      />

      <Panel padding={true}>
        <div className="d-flex flex-column gap-4">
          <div className="row gy-4">
            <TempInput {...{
              label: "Title",
              placeholder: "Voice name",
              onChange: inputCtrl(titleSet),
              value: title
            }}/>
          </div>

          <div>
            <TempSelect {...{
              icon: faLanguage,
              label: "Language",
              // placeholder: "Voice name",
              onChange: inputCtrl(languageSet),
              options: languages,
              value: language
            }}
            />
          </div>

          <div>
            <TempSelect
              {...{
                icon: faEye,
                label: "Visibility",
                // placeholder: "Voice name",
                onChange: inputCtrl(visibilitySet),
                options: visibilityOptions,
                value: visibility
              }}
            />
          </div>

          <Button {...{ label: "Save", onClick }}/>
        </div>
      </Panel>
    </Container>
  );
}

export { VoiceDesignerVoiceEditPage };
