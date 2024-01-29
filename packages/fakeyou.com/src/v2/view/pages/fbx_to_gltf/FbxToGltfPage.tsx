import { faArrowRightArrowLeft } from "@fortawesome/pro-solid-svg-icons";
import { Button, Container, Panel } from "components/common";
import FileInput from "components/common/FileInput";
import PageHeader from "components/layout/PageHeader";
import { useFile } from "hooks";
import React from "react";

interface FbxToGltfPageProps {}

export default function FbxToGltfPage(props: FbxToGltfPageProps) {
  const fileProps = useFile({});

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
