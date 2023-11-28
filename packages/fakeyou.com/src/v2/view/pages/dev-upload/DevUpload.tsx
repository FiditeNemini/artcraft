import Panel from "components/common/Panel";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import React, { useState } from "react";
import { Button } from "components/common";
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
          <input
            className="form-control form-control-lg"
            id="formFile"
            type="file"
            onChange={handleFileChange}
          />
          <Button
            full={true}
            icon={faUpload}
            label="Upload File"
            onClick={handleUpload}
          />
        </div>
      </Panel>
    </Container>
  );
}
