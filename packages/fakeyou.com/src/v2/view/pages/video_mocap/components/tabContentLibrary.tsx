import React from "react";

interface Props{
  t: Function
}
export default function TabContentLibrary(props: Props){
  const { t } = props

  return(
    <div
      className="tab-pane fade"
      id="vmcLibrary"
    >
      <div className="d-flex flex-column gap-4 h-100">
        <div className="d-flex flex-column gap-3">
          <p>{t("input.filenamePlaceholder")}</p>
          <p>{t("button.select")}</p>
          <p>{t("button.generate")}</p>
        </div>
      </div>
    </div>

  )
}