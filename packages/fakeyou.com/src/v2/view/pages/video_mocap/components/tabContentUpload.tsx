import React, {useState} from "react";

import { useFile } from "hooks";

import VideoInput from "v2/view/pages/video_mocap/components/VideoInput";

export default function TabContentUpload(props:{
  t: Function
}){
  const { t } = props
  const videoProps = useFile({})
  const [videoReady, setVideoReady] = useState<boolean>(false);

  // contains upload inout state and controls, see docs
  return(
    <div
      className="tab-pane fade show active py-4"
      id="vmcUpload"
    >
        <div className="row">
          <div className="col-12">
            <VideoInput {...{ ...t, ...videoProps,
              onRest: () => setVideoReady(videoProps.file ? true:false),
            }}/>
          </div>
        </div>

        <div className="row py-3">
          <div className="col-12">
            <div className="d-flex justify-content-end gap-3">
              <button
                className="btn btn-primary"
                disabled={!videoReady}
              >{t("button.upload")}</button>
              <button className="btn btn-primary" disabled>{t("button.generate")}</button>
            </div>
          </div>
        </div>
    </div>
  )
}