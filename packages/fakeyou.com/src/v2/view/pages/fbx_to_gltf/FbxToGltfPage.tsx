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

  const { inferenceJobs } = useInferenceJobs(
    FrontendInferenceJobType.VideoMotionCapture
  );
  const hasConversionJobs = inferenceJobs && inferenceJobs.length > 0;

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

  async function EnqueueFbxToGltf(file: any) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log("EnqueueFbxToGltf", file);
      }, 1000);
    });
  }

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
        return { upload_token: res.upload_token };
      }
      // Handle failure scenario - perhaps throw an error or return a specific result
      console.error("Upload failed:", res);
      return null;
    } catch (error) {
      console.error("Error in upload:", error);
      // Handle the error appropriately
      return null;
    }
  };

  const EnqueueConvert = async (params: any) => {
    let request: any = {
      uuid_idempotency_token: uuidv4(),
      file_source: undefined,
      upload_token: params.upload_token,
    };

    const response = await EnqueueFbxToGltf(request);

    console.log("Response: ", response);

    // if (response.inference_job_token) {
    //   enqueueInferenceJob(
    //     response.inference_job_token,
    //     FrontendInferenceJobType.ConvertFbxtoGltf
    //   );
    // }
  };

  const uploadAndConvert = async () => {
    try {
      const uploadResponse = await handleUploadFBX();
      if (uploadResponse && uploadResponse.upload_token) {
        await EnqueueConvert({
          upload_token: uploadResponse.upload_token,
        });
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
      // Handle upload error
    }
  };

  const submit = async () => {
    if (mediaToken && presetFile) {
      EnqueueConvert({ upload_token: mediaToken });
    } else if (fileProps.file) {
      await uploadAndConvert();
    } else {
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

      {hasConversionJobs && (
        <div className="mb-4">
          <FbxToGltfJobList />
        </div>
      )}

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
              disabled={!fileProps.file}
            />
          </div>
        </div>
      </Panel>
    </Container>
  );
}
