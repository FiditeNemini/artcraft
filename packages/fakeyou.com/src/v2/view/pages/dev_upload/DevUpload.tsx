import Panel from "components/common/Panel";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import React, { useState } from "react";
import { Button, Input, TempInput } from "components/common";
import { faUpload } from "@fortawesome/pro-solid-svg-icons";

interface DevUploadProps {}

export default function DevUpload(props: DevUploadProps) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }
    console.log("Uploading", selectedFile);
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
