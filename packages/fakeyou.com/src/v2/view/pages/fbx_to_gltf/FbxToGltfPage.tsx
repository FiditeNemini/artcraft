import {
  faArrowRightArrowLeft,
  faFile,
  faTrashAlt,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Container, Panel } from "components/common";
import FileInput from "components/common/FileInput";
import PageHeader from "components/layout/PageHeader";
import { useFile, useInferenceJobs, useMedia } from "hooks";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { UploadMedia } from "@storyteller/components/src/api/media_files/UploadMedia";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import FbxToGltfJobList from "./components/FbxToGltfJobList";
import {
  EnqueueFbxToGltf,
  EnqueueFbxToGltfIsSuccess,
  EnqueueFbxToGltfIsError,
} from "@storyteller/components/src/api/file_conversion/EnqueueFbxToGltf";

interface FbxToGltfPageProps {
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
}

export default function FbxToGltfPage({
  enqueueInferenceJob,
}: FbxToGltfPageProps) {
  const history = useHistory();
  const { mediaToken: mediaTokenParam } = useParams<{ mediaToken: string }>();
  const [mediaToken, setMediaToken] = useState<string | null>(mediaTokenParam);
  const { media: presetFile } = useMedia({
    mediaToken: mediaToken ?? undefined,
  });
  const fileProps = useFile({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const { inferenceJobs } = useInferenceJobs(
    FrontendInferenceJobType.ConvertFbxtoGltf
  );

  console.log("inferenceJobs", inferenceJobs);

  useEffect(() => {
    // If there's a mediaToken, automatically prepare the file for conversion
    if (mediaToken && presetFile) {
    }
  }, [mediaToken, presetFile]);

  const clearMediaToken = () => {
    // Reset the media token state
    setMediaToken(null);
    history.push("/fbx-to-gltf");
  };

  const makeFBXUploadRequest = () => ({
    uuid_idempotency_token: uuidv4(),
    file: fileProps.file,
    source: "file",
    type: "fbx/model",
  });

  const handleUploadFBX = async () => {
    try {
      const res = await UploadMedia(makeFBXUploadRequest());
      if (res.success && res.media_file_token) {
        return { upload_token: res.media_file_token };
      }
      console.error("Upload failed:", res);
      return null;
    } catch (error) {
      console.error("Error in upload:", error);
      return null;
    }
  };

  const submit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsWorking(true);
    try {
      let uploadToken = mediaToken;

      // If no media token, upload the file first
      if (!mediaToken && fileProps.file) {
        const uploadResponse = await handleUploadFBX();
        if (uploadResponse && uploadResponse.upload_token) {
          uploadToken = uploadResponse.upload_token;
        } else {
          console.error("Failed to upload file. Response:", uploadResponse);
          throw new Error("File upload failed");
        }
      }

      // Enqueue the conversion job
      if (uploadToken) {
        await EnqueueConvert({ upload_token: uploadToken });
      } else {
        console.error("No upload token available for conversion");
      }
    } catch (error) {
      console.error("Error in submit process: ", error);
    } finally {
      setIsWorking(false);
      setIsSubmitting(false);
    }
  };

  const EnqueueConvert = async ({ upload_token }: any) => {
    if (!upload_token) return false;

    try {
      let request = {
        uuid_idempotency_token: uuidv4(),
        file_source: undefined,
        media_file_token: upload_token,
      };

      const response = await EnqueueFbxToGltf(request);

      if (EnqueueFbxToGltfIsSuccess(response)) {
        console.log("Enqueue successful");

        if (response && response.inference_job_token) {
          enqueueInferenceJob(
            response.inference_job_token,
            FrontendInferenceJobType.ConvertFbxtoGltf
          );
        }
        return true;
      } else if (EnqueueFbxToGltfIsError(response)) {
        throw new Error("Enqueue failed");
      }
    } catch (error) {
      console.error("Error in enqueueing conversion: ", error);
      return false;
    }
  };

  return (
    <Container type="panel">
      <PageHeader
        title="Convert FBX to glTF"
        subText="For converting 3D model assets on FBX format to glTF 2.0 for use with Storyteller Studio."
        imageUrl="/images/header/fbx-to-gltf.png"
      />

        <div className="mb-4">
          <FbxToGltfJobList />
        </div>

      <Panel padding={true}>
        <div className="d-flex flex-column gap-3">
          {mediaToken && presetFile ? (
            <div>
              <label className="sub-title">FBX file from media</label>
              <Panel className="panel-inner p-3 rounded">
                <div className="d-flex gap-3 align-items-center flex-wrap">
                  <div className="d-flex gap-3 flex-grow-1 align-items-center">
                    <FontAwesomeIcon icon={faFile} className="display-6" />
                    <div>
                      <h6 className="mb-1">{presetFile.token}</h6>
                      <p className="opacity-75">
                        Created by {presetFile.maybe_creator_user?.display_name}
                      </p>
                    </div>
                  </div>
                  <Button
                    icon={faTrashAlt}
                    square={true}
                    onClick={clearMediaToken}
                    variant="danger"
                    small={true}
                    tooltip="Remove file"
                  />
                </div>
              </Panel>
            </div>
          ) : (
            <FileInput
              {...fileProps}
              label="Select FBX File"
              fileTypes={["FBX"]}
              mediaToken={mediaToken}
            />
          )}

          <div className="d-flex justify-content-end">
            <Button
              icon={faArrowRightArrowLeft}
              label="Convert to glTF"
              onClick={submit}
              disabled={!mediaToken && !fileProps.file}
              isLoading={isWorking}
            />
          </div>
        </div>
      </Panel>
    </Container>
  );
}
