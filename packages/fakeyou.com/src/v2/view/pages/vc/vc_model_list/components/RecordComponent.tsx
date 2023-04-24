import React, { useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { InputVcAudioPlayer } from "../../../../_common/InputVcAudioPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/pro-solid-svg-icons";

export default function RecordComponent() {
  const [recorded, setRecorded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioLink, setAudioLink] = useState<string>();

  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder();

  const addAudioElement = (blob: any) => {
    stopRecording();
    setLoading(true);

    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob);
      setAudioLink(url);
      setRecorded(true);
      setLoading(false);
      return;
    }
  };

  return (
    <div className="d-flex flex-column gap-3" id="record-audio">
      {isRecording ? (
        <button className="btn btn-secondary" onClick={addAudioElement}>
          {loading ? (
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Saving...</span>
              </div>
              Saving
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <div
                className="spinner-grow spinner-grow-sm text-danger me-2"
                role="status"
              >
                <span className="visually-hidden">Recording...</span>
              </div>
              Stop Recording
            </div>
          )}
        </button>
      ) : (
        <button className="btn btn-secondary" onClick={startRecording}>
          <FontAwesomeIcon icon={faMicrophone} className="me-2" />
          Start Recording
        </button>
      )}

      {recorded ? (
        <div className="panel panel-inner rounded p-3">
          <InputVcAudioPlayer filename={audioLink as string} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

/*
  In case you'd like to update colors of the icons just follow the instruction here:
  https://github.com/samhirtarif/react-audio-recorder/issues/19#issuecomment-1420248073
*/
