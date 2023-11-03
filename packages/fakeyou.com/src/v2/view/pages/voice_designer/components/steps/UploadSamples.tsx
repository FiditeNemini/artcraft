import React, { useState } from "react";
import VoiceDesignerUploadComponent from "../VoiceDesignerUploadComponent";
import { v4 as uuidv4 } from "uuid";

function UploadSamples() {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [convertLoading, setConvertLoading] = useState(false);
  const [canConvert, setCanConvert] = useState(false);
  const [mediaUploadToken, setMediaUploadToken] = useState<string | undefined>(
    undefined
  );
  const [convertIdempotencyToken, setConvertIdempotencyToken] = useState(
    uuidv4()
  );
  /* eslint-disable @typescript-eslint/no-unused-vars */

  const [formIsCleared, setFormIsCleared] = useState(false);

  const changeConvertIdempotencyToken = () => {
    setConvertIdempotencyToken(uuidv4());
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <label className="sub-title">Upload Audio</label>
        <div className="d-flex flex-column gap-3 upload-component">
          <VoiceDesignerUploadComponent
            setMediaUploadToken={setMediaUploadToken}
            formIsCleared={formIsCleared}
            setFormIsCleared={setFormIsCleared}
            setCanConvert={setCanConvert}
            changeConvertIdempotencyToken={changeConvertIdempotencyToken}
          />
        </div>
      </div>
    </div>
  );
}

export { UploadSamples };
