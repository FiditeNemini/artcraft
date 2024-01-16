import React from "react";

interface Props{
  t: Function
}

export default function TabContentUpload(props:Props){
  const { t } = props

  return(
    <div
      className="tab-pane fade show active"
      id="vmcUpload"
    >
      <div className="d-flex flex-column gap-4 h-100">
          <div className="d-flex flex-column gap-3">
            <p>{t("input.dropzoneDescription")}</p>
            <p>{t("button.upload")}</p>
            <p>{t("button.generate")}</p>
          </div>
        </div>

    </div>
  )
}