import { faArrowRightArrowLeft } from "@fortawesome/pro-solid-svg-icons";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { Button, Container, Panel } from "components/common";
import FileInput from "components/common/FileInput";
import PageHeader from "components/layout/PageHeader";
import { useFile, useMedia } from "hooks";
import React from "react";
import { useParams } from "react-router-dom";

interface FbxToGltfPageProps {}

export default function FbxToGltfPage(props: FbxToGltfPageProps) {
  const { mediaToken } = useParams<{ mediaToken: string }>();
  const { media } = useMedia({ mediaToken });
  const fileProps = useFile({});

  let fileBucketPath = new BucketConfig().getGcsUrl(media?.public_bucket_path);

  if (mediaToken) {
    //sets media file
    fileProps.blob = fileBucketPath;
  }

  return (
    <Container type="panel">
      <PageHeader
        title="Convert FBX to glTF"
        subText="For converting 3D model assets on FBX format to glTF 2.0 for use with Storyteller Studio."
        imageUrl="/images/header/fbx-to-gltf.png"
      />

      <Panel padding={true}>
        <div className="d-flex flex-column gap-3">
          <FileInput
            {...fileProps}
            label="Select FBX File"
            fileTypes={["FBX"]}
          />
          <div className="d-flex justify-content-end">
            <Button
              icon={faArrowRightArrowLeft}
              label="Convert to glTF"
              onClick={() => {}}
            />
          </div>
        </div>
      </Panel>
    </Container>
  );
}
