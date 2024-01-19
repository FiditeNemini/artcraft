import React, {useState} from "react";
import { v4 as uuidv4 } from "uuid";

import { UploadVideo } from '@storyteller/components/src/api/upload/UploadVideo'
import { useFile } from "hooks";

import VideoInput from "v2/view/pages/video_mocap/components/VideoInput";

export default function TabContentUpload(props:{
  t: Function
}){
  const { t } = props
  const videoProps = useFile({})
  const NO_FILE = 0
  const FILE_STAGED = 1
  const FILE_UPLOADING = 2
  const FILE_UPLOADED = 3
  const [videoState, setVideoState] = useState<number>(NO_FILE);

  const makeRequest = () => ({
    uuid_idempotency_token: uuidv4(),
    file: videoProps.file,
    source: "file",
    type:"video",
  });

  const handleUploadVideo = ()=>{
    setVideoState(FILE_UPLOADING)
    UploadVideo(makeRequest()).then((res=>{
      console.log("RESPONSE >>>")
      console.log(res)
      setVideoState(FILE_UPLOADED)
    }));
  }
  // contains upload inout state and controls, see docs
  return(
    <div
      className="tab-pane fade show active py-4"
      id="vmcUpload"
    >
        <div className="row">
          <div className="col-12">
            <VideoInput {...{t, ...videoProps,
              onStateChange: () => setVideoState(videoProps.file ? FILE_STAGED : NO_FILE),
            }}/>
          </div>
        </div>

        <div className="row py-3">
          <div className="col-12">
            <div className="d-flex justify-content-end gap-3">
              <button
                className="btn btn-primary"
                disabled={videoState!==FILE_STAGED}
                onClick={handleUploadVideo}
              >{t("button.upload")}</button>
              <button className="btn btn-primary" disabled={videoState!==FILE_UPLOADED}>{t("button.generate")}</button>
            </div>
          </div>
        </div>
    </div>
  )
}