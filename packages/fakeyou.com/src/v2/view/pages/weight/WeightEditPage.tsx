import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  faCircleExclamation,
  faEye,
  // faLanguage,
  faWaveform,
} from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import TempInput from "components/common/TempInput";
import { Button, TempSelect } from "components/common";
// import useVoiceRequests from "./useVoiceRequests";
// import { useHistory } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import TextArea from "components/common/TextArea";
import { useWeightFetch } from "hooks";
import SplitPanel from "components/common/SplitPanel";
import Skeleton from "components/common/Skeleton";

interface WeightEditPageProps {
  sessionWrapper: SessionWrapper;
}

export default function WeightEditPage({
  sessionWrapper,
}: WeightEditPageProps) {
  // const [language, languageSet] = useState("en");
  // const [fetched, fetchedSet] = useState(false);
  // const history = useHistory();
  const { weight_token } = useParams<{ weight_token: string }>();
  const [weightCreatorToken] = useState("");

  const {
    // data: weight,
    descriptionMD,
    // fetchError,
    isLoading,
    onChange,
    title,
    update,
    visibility,
  } = useWeightFetch({ token: weight_token });

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

  const visibilityOptions = [
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
  ];

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

      <>
        {!isLoading ? (
          <Panel padding={true}>
            <div className="d-flex flex-column gap-3">
              <Skeleton type="short" />
              <Skeleton height="40px" />
              <Skeleton type="short" />
              <Skeleton height="40px" />
              <div className="d-flex justify-content-end mt-3 gap-2">
                <Skeleton height="40px" width="120px" />
                <Skeleton height="40px" width="120px" />
              </div>
            </div>
          </Panel>
        ) : (
          <SplitPanel dividerFooter={true}>
            <SplitPanel.Body padding={true}>
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
                        name: "title",
                        onChange,
                        placeholder: "Title",
                        value: title,
                      }}
                    />
                  </div>
                  <div>
                    <TextArea
                      {...{
                        label: "Description",
                        name: "descriptionMD",
                        onChange,
                        placeholder: "Description",
                        value: descriptionMD,
                      }}
                    />
                  </div>
                </div>
              </div>
              {
                // <div className="mt-lg-2">
                //   <TempSelect
                //     options={[]}
                //     {...{
                //       icon: faLanguage,
                //       label: "Language",
                //       // placeholder: "Voice name",
                //       // onChange: inputCtrl(languageSet),
                //       // options: languages,
                //       value: language,
                //     }}
                //   />
                // </div>
              }
              <div className="mt-3">
                <TempSelect
                  {...{
                    icon: faEye,
                    label: "Visibility",
                    name: "visibility",
                    options: visibilityOptions,
                    onChange,
                    placeholder: "Voice name",
                    value: visibility,
                  }}
                />
              </div>
            </SplitPanel.Body>
            <SplitPanel.Footer padding={true}>
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
                    onClick: update,
                  }}
                />
              </div>
            </SplitPanel.Footer>
          </SplitPanel>
        )}
      </>
    </Container>
  );
}
