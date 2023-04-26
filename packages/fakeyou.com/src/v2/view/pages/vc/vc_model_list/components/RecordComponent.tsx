import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { InputVcAudioPlayer } from "../../../../_common/InputVcAudioPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faUpload } from "@fortawesome/pro-solid-svg-icons";
import { UploadAudio, UploadAudioIsOk, UploadAudioRequest } from "@storyteller/components/src/api/upload/UploadAudio";
import { faRightLeft, faTrash } from "@fortawesome/free-solid-svg-icons";

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

interface Props {
  setMediaUploadToken: (token: string) => void,

  formIsCleared: boolean,
  setFormIsCleared: (cleared: boolean) => void,
}

export default function RecordComponent(props: Props) {
  const { startRecording, stopRecording, recordingBlob, isRecording } =
    useAudioRecorder();

  useEffect(() => {
    // NB: This is used to detect changes to `recordingBlob` and upload them
    if (!recordingBlob) {
      return;
    }

    //(async () => {
    //  let idempotencyToken = uuidv4();

    //  const request : UploadAudioRequest = {
    //    uuid_idempotency_token: idempotencyToken,
    //    file: recordingBlob,
    //    source: 'device',
    //  }

    //  let result = await UploadAudio(request);

    //  if (UploadAudioIsOk(result)) {
    //    //setIsUploadDisabled(true);
    //    //ggprops.setMediaUploadToken(result.upload_token);
    //    props.setMediaUploadToken(result.upload_token);
    //  }
    //})();
  }, [recordingBlob])

  const handleStartRecording = async () => {
    startRecording();
    props.setFormIsCleared(false);
  };

  const handleStopRecording = async (blob: any) => {
    stopRecording();
  };

  const handleClear = () => {
    stopRecording();
    props.setFormIsCleared(true);
  };

  const handleUpload = async () => {
    const request : UploadAudioRequest = {
      uuid_idempotency_token: uuidv4(), // TODO: only send on change.
      file: recordingBlob,
      source: 'device',
    }

    let result = await UploadAudio(request);

    if (UploadAudioIsOk(result)) {
      //setIsUploadDisabled(true);
      //ggprops.setMediaUploadToken(result.upload_token);
      props.setMediaUploadToken(result.upload_token);
    }
  }

  const speakButtonClass = false
    ? "btn btn-primary w-100 disabled"
    : "btn btn-primary w-100";

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
        <button className="btn btn-secondary" onClick={handleStartRecording}>
          <FontAwesomeIcon icon={faMicrophone} className="me-2" />
          Start Recording
        </button>
      )}

      {props.formIsCleared ? (
          <></>
        ) : (

          <>
            <RecordedAudioComponent recordingBlob={recordingBlob} />

            <div className="d-flex gap-3">
              <button
                className={speakButtonClass}
                onClick={handleUpload}
                type="submit"
                disabled={false}
              >
                <FontAwesomeIcon
                  icon={faUpload}
                  className="me-2"
                />
                Upload
              </button>
              <button
                className="btn btn-destructive w-100"
                onClick={handleClear}
                disabled={false}
              >
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Clear
              </button>
            </div>
          </>
        )

      }

    </div>
  );
}

/*
  In case you'd like to update colors of the icons just follow the instruction here:
  https://github.com/samhirtarif/react-audio-recorder/issues/19#issuecomment-1420248073
*/
