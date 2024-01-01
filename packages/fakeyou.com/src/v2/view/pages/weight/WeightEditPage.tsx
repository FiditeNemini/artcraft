import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { a, useTransition } from "@react-spring/web";
import {
  faCircleExclamation,
  faEye,
  faImage,
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
  ImageInput,
  TempInput,
  TempSelect,
  TempTextArea,
} from "components/common";
import { WorkIndicator } from "components/svg";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { useWeightFetch } from "hooks";
import "./WeightEditPage.scss";

interface WeightEditPageProps {
  sessionWrapper: SessionWrapper;
}

// UploadControl will eventually live elsewhere
const UploadControl = ({
  onClick,
  status,
}: {
  onClick: (x: any) => any;
  status: FetchStatus;
}) => {
  const failure = status === FetchStatus.error;
  const success = status === FetchStatus.success;

  return status === FetchStatus.ready ? (
    <Button
      {...{
        className: "upload-control-btn",
        label: "Upload image",
        onClick,
        variant: "secondary",
      }}
    />
  ) : (
    <div {...{ className: "upload-control-indicator" }}>
      <WorkIndicator
        {...{
          failure,
          stage: success ? 2 : 1,
          success,
        }}
      />
      <span>{success ? "Cover image uploaded" : "Uploading ..."}</span>
    </div>
  );
};

export default function WeightEditPage({
  sessionWrapper,
}: WeightEditPageProps) {
  // const [language, languageSet] = useState("en");
  // const [fetched, fetchedSet] = useState(false);
  // const history = useHistory();
  const { weight_token } = useParams<{ weight_token: string }>();
  const [weightCreatorToken] = useState("");

  const {
    data: weight,
    descriptionMD,
    // fetchError,
    // imgMediaFile,
    imageProps,
    imgUploadStatus,
    isLoading,
    onChange,
    title,
    uploadCoverImg,
    update,
    visibility,
  } = useWeightFetch({ token: weight_token });

  const src = new BucketConfig().getGcsUrl(
    weight?.maybe_cover_image_public_bucket_path || ""
  );

  const [editingImg, editingImgSet] = useState(0);

  const transitions = useTransition(editingImg, {
    config: { tension: 120, friction: 15 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  usePrefixedDocumentTitle("Edit Voice");

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
    <Container type="panel" className="mb-5">
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
              <div {...{ className: "weight-editor row gy-3 gx-4" }}>
                <div {...{ className: "col-12 col-lg-5" }}>
                  <label className="sub-title">Cover Image</label>
                  <div {...{ className: "fy-cover-img-input" }}>
                    {" "}
                    {weight?.maybe_cover_image_public_bucket_path &&
                      transitions((style, i) =>
                        !i ? (
                          <a.div
                            {...{
                              className: "weight-initial-cover-img",
                              style: {
                                ...style,
                                backgroundImage: `url(${src})`,
                              },
                            }}
                          >
                            <div>
                              <Button
                                {...{
                                  className: "upload-control-btn",
                                  label: "Change cover image",
                                  onClick: () => editingImgSet(1),
                                  variant: "secondary",
                                }}
                              />
                            </div>
                          </a.div>
                        ) : (
                          <a.div {...{ style }}>
                            <ImageInput
                              {...{
                                ...imageProps,
                                disabled: imgUploadStatus > 1,
                                placeholderIcon: faImage,
                              }}
                            >
                              <div {...{ className: "fy-cover-control" }}>
                                <UploadControl
                                  {...{
                                    onClick: uploadCoverImg,
                                    status: imgUploadStatus,
                                  }}
                                />
                              </div>
                            </ImageInput>
                          </a.div>
                        )
                      )}{" "}
                  </div>
                </div>
                <div {...{ className: "col-lg-7 order-first  order-lg-last" }}>
                  <TempInput
                    {...{
                      label: "Title",
                      name: "title",
                      onChange,
                      placeholder: "Title",
                      value: title,
                    }}
                  />
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
                  <TempTextArea
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
