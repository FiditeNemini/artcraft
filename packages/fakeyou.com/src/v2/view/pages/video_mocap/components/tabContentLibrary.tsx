import React from "react";

export default function TabContentLibrary(props: {
  t: Function
}){
  const { t } = props
  return(
    <div
      className="tab-content fade"
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