import React from "react";
import VideoInput from "v2/view/pages/video_mocap/components/uploadFieldVideo";

export default function TabContentUpload(props:{
  t: Function
}){
  const { t } = props
  return(
    <div
      className="tab-pane fade show active py-4"
      id="vmcUpload"
    >
        <div className="row">
          <div className="col-12">
            <VideoInput t={t}/>
          </div>
        </div>

        <div className="row py-3">
          <div className="col-12">
            <div className="d-flex justify-content-end gap-3">
              <button className="btn btn-primary">{t("button.upload")}</button>
              <button className="btn btn-primary" disabled>{t("button.generate")}</button>
            </div>
          </div>
        </div>
    </div>
  )
}