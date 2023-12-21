import Panel from "components/common/Panel";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import React, { useState } from "react";
import { Button, Input } from "components/common";
import { faUpload } from "@fortawesome/pro-solid-svg-icons";
import {
  UploadMediaFile,
  UploadMediaFileRequest,
} from "@storyteller/components/src/api/media_files/UploadMediaFile";
import { v4 as uuidv4 } from "uuid";

interface DevUploadProps {}

export default function DevUpload(props: DevUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const makeRequest = async (): Promise<UploadMediaFileRequest | null> => {
    if (!selectedFile) {
      return null;
    }

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(selectedFile);

    return new Promise(resolve => {
      fileReader.onload = () => {
        const result = fileReader.result;
        if (result instanceof ArrayBuffer) {
          resolve({
            uuid_idempotency_token: uuidv4(),
            file_name: selectedFile.name,
            file_bytes: result,
            media_source: "file",
          });
        }
      };
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    const request = await makeRequest();
    if (request) {
      UploadMediaFile(request)
        .then(res => {
          if (res) {
            console.log(res);
          }
        })
        .catch(error => {
          console.error("Upload failed:", error);
        });
    }
  };

  return (
    <Container type="padded" className="pt-4 pt-lg-5">
      <PageHeader
        title="Upload Generic File"
        subText="Upload files to the server for testing."
      />

      <Panel padding={true}>
        <div className="d-flex flex-column gap-5">
          <Input label="File Name" />
          <input
            className="form-control form-control-lg"
            id="formFile"
            type="file"
            onChange={handleFileChange}
          />
          <div className="d-flex gap-3 justify-content-end">
            <Button
              icon={faUpload}
              label="Upload Media"
              onClick={handleUpload}
            />
          </div>
        </div>
      </Panel>
    </Container>
  );
}
