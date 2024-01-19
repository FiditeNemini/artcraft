import Panel from "components/common/Panel";
import Container from "components/common/Container";
import PageHeader from "components/layout/PageHeader";
import React, { useState } from "react";
import { Button } from "components/common";
import { faUpload } from "@fortawesome/pro-solid-svg-icons";
import {
  UploadMedia,
  UploadMediaResponse,
} from "@storyteller/components/src/api/media_files/UploadMedia";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";

interface DevUploadProps {}

export default function DevUpload(props: DevUploadProps) {
  const [file, fileSet] = useState<File | null>(null);
  const [tokens, tokensSet] = useState<string[]>([]);

  const handleFileChange = (event: any) => {
    fileSet(event.target.files[0]);
  };

  const handleUpload = () => {
    if (file)
      UploadMedia({
        uuid_idempotency_token: uuidv4(),
        file,
        source: "file",
      }) // if there an audio file it uploads here
        .then((res: UploadMediaResponse) => {
          if ("media_file_token" in res) {
            console.log("📁 upload response:", res);
            tokensSet([res.media_file_token, ...tokens]);
            fileSet(null);
          }
        });
    else console.log("🥺 no file");
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
          <div className="d-flex gap-3 justify-content-end">
            <Button
              disabled={!file}
              icon={faUpload}
              label="Upload Media"
              onClick={handleUpload}
            />
          </div>
          <h2>Your uploads</h2>
          {tokens.map((token: string, key: number) => (
            <Link {...{ key, to: `/media/${token}` }}>{token}</Link>
          ))}
        </div>
      </Panel>
    </Container>
  );
}
