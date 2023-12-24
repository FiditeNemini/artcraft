import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  faCircleExclamation,
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
// import useVoiceRequests from "./useVoiceRequests";
import { useHistory } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import TextArea from "components/common/TextArea";

interface WeightEditPageProps {
  sessionWrapper: SessionWrapper;
}

export default function WeightEditPage({
  sessionWrapper,
}: WeightEditPageProps) {
  const [language, languageSet] = useState("en");
  const [visibility, visibilitySet] = useState("hidden");
  const [title, titleSet] = useState("");
  const [fetched, fetchedSet] = useState(false);
  const history = useHistory();
  const { weight_token } = useParams<{ weight_token: string }>();
  const [weightCreatorToken, setWeightCreatorToken] = useState("");

  // const { inputCtrl, languages, visibilityOptions, voices } = useVoiceRequests(
  //   {}
  // );

  usePrefixedDocumentTitle("Edit Voice");

  //   const onClick = () =>
  //     voices
  //       .update(weight_token, {
  //         title,
  //         creator_set_visibility: visibility,
  //         ietf_language_tag: language,
  //       })
  //       .then((res: any) => {
  //         if (res && res.success) {
  //           history.push("/voice-designer");
  //         }
  //       });

  //   useEffect(() => {
  //     if (!fetched && weight_token) {
  //       fetchedSet(true);
  //       voices.get(weight_token, {}).then(res => {
  //         languageSet(res.ietf_language_tag);
  //         titleSet(res.title);
  //         visibilitySet(res.creator_set_visibility);
  //       });
  //     }
  //   }, [fetched, weight_token, voices]);

  if (
    !sessionWrapper.canEditTtsModelByUserToken(weightCreatorToken) === false ||
    !weight_token
  ) {
    return (
      <Container type="panel">
        <PageHeader
          titleIcon={faCircleExclamation}
          title="Access Denied"
          subText="This weight does not exist or is not owned by you."
          panel={true}
          extension={
            <div className="d-flex">
              <Button
                label="Back to homepage"
                to={`/weight/{}`}
                className="d-flex"
              />
            </div>
          }
        />
      </Container>
    );
  }

  return (
    <Container type="panel">
      <PageHeader
        title="Edit Weight"
        titleIcon={faWaveform}
        subText="Make changes to your weight details"
        panel={false}
        showBackButton={true}
        backbuttonLabel="Back"
        backbuttonTo={`/weight/${weight_token}`}
      />

      <Panel className="mb-5">
        <div className="d-flex flex-column gap-3 p-3 py-4 p-md-4">
          <div className="d-flex flex-column flex-lg-row gap-4">
            {/* Replace this with an image component component */}
            <div className="bg-secondary rounded p-3">
              cover image select component here
            </div>

            <div className="w-100 d-flex flex-column gap-3">
              <div>
                <TempInput
                  {...{
                    label: "Title",
                    placeholder: "Title",
                    // onChange: inputCtrl(titleSet),
                    value: title,
                  }}
                />
              </div>
              <div>
                <TextArea
                  {...{
                    label: "Description",
                    placeholder: "Description",
                    // onChange: inputCtrl(titleSet),
                    value: title,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-lg-2">
            <TempSelect
              options={[]}
              {...{
                icon: faLanguage,
                label: "Language",
                // placeholder: "Voice name",
                // onChange: inputCtrl(languageSet),
                // options: languages,
                value: language,
              }}
            />
          </div>

          <div>
            <TempSelect
              options={[]}
              {...{
                icon: faEye,
                label: "Visibility",
                placeholder: "Voice name",
                // onChange: inputCtrl(visibilitySet),
                // options: visibilityOptions,
                value: visibility,
              }}
            />
          </div>
        </div>
        <hr className="mt-0 mb-4" />
        <div className="p-3 pb-4 px-lg-4 pt-0">
          <div className="d-flex gap-2 justify-content-end">
            <Button
              {...{
                label: "Cancel",
                to: `/weight/${weight_token}`,
                variant: "secondary",
              }}
            />
            <Button
              {...{
                label: "Save Changes",
                // onClick
              }}
            />
          </div>
        </div>
      </Panel>
    </Container>
  );
}
