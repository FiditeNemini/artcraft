import React, { useState } from "react";
import {
  faCircleExclamation,
  faEye,
  faWaveform,
} from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import PageHeader from "components/layout/PageHeader";
import {
  Button,
  Container,
  Panel,
  Skeleton,
  SplitPanel,
  TempInput,
  TempSelect,
  TempTextArea,
} from "components/common";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface UploadSdWeightPageProps {
  sessionWrapper: SessionWrapper;
}

export default function UploadSdWeightPage({
  sessionWrapper,
}: UploadSdWeightPageProps) {
  const [isLoading] = useState(false);

  usePrefixedDocumentTitle("Edit Voice");

  const visibilityOptions = [
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
  ];

  if (!sessionWrapper.isLoggedIn() && !isLoading) {
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
        title="Upload Stable Diffusion Weight"
        titleIcon={faWaveform}
        subText="Upload a Stable Diffusion Image model weight. Once your weight is successfully uploaded, you'll be able to start using it and sharing it with others."
        panel={false}
      />

      <>
        {isLoading ? (
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
              <div className="row gx-4 gy-3">
                <div className="col-12 col-lg-4">
                  <label className="sub-title required">Cover Image</label>
                </div>
                <div className="col-12 col-lg-8 d-flex flex-column gap-3 order-first order-lg-last">
                  <div>
                    <TempInput
                      {...{
                        label: "Title",
                        name: "title",
                        placeholder: "Title",
                        required: true,
                      }}
                    />
                  </div>
                  <div>
                    <TempSelect
                      {...{
                        icon: faEye,
                        label: "Visibility",
                        name: "visibility",
                        options: visibilityOptions,
                        placeholder: "Voice name",
                      }}
                    />
                  </div>
                  <div>
                    <TempTextArea
                      {...{
                        label: "Description",
                        name: "descriptionMD",
                        placeholder: "Description",
                      }}
                    />
                  </div>
                </div>
              </div>
            </SplitPanel.Body>
            <SplitPanel.Footer padding={true}>
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  {...{
                    label: "Upload Weight",
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
