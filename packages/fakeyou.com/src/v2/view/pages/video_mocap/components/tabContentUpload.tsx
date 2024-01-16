import React from "react";
import VideoInput from "v2/view/pages/video_mocap/components/uploadFieldVideo";

export default function TabContentUpload(props:{
  t: Function
}){
  const { t } = props
  return(
    <div
      className="tab-content fade show active"
      id="vmcUpload"
    >
        <div className="row">
          <div className="col-12">
            <VideoInput t={t}/>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-end">
              <button className="btn btn-primary m-1">{t("button.upload")}</button>
              <button className="btn btn-primary m-1" disabled>{t("button.generate")}</button>
            </div>
          </div>
        </div>
    </div>
  )
}