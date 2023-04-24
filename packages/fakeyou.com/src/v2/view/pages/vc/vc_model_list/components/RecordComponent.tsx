import React, { useMemo, useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { InputVcAudioPlayer } from "../../../../_common/InputVcAudioPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/pro-solid-svg-icons";

interface RecorderProps {
  recordingBlob: any;
}

function RecordedAudioComponent(props: RecorderProps) {

  // Only generate the URL on change.
  const audioLink = useMemo(() => {
    if (!props.recordingBlob) {
      return;
    }
    return URL.createObjectURL(props.recordingBlob);
  }, [props.recordingBlob]);

  if (!props.recordingBlob) {
    return <></>;
  }

  return (
    <div className="panel panel-inner rounded p-3">
      <InputVcAudioPlayer filename={audioLink as string} />
    </div>
  );
}

export default function RecordComponent() {
  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder();

  const handleStopRecording = (blob: any) => {
    stopRecording();
  };

  return (
    <div className="d-flex flex-column gap-3" id="record-audio">
      {isRecording ? (
        <button className="btn btn-secondary" onClick={handleStopRecording}>
          <div className="d-flex align-items-center">
            <div
              className="spinner-grow spinner-grow-sm text-danger me-2"
              role="status"
            >
              <span className="visually-hidden">Recording...</span>
            </div>
            Stop Recording
          </div>
        </button>
      ) : (
        <button className="btn btn-secondary" onClick={startRecording}>
          <FontAwesomeIcon icon={faMicrophone} className="me-2" />
          Start Recording
        </button>
      )}

      <RecordedAudioComponent recordingBlob={recordingBlob} />
    </div>
  );
}

/*
  In case you'd like to update colors of the icons just follow the instruction here:
  https://github.com/samhirtarif/react-audio-recorder/issues/19#issuecomment-1420248073
*/
