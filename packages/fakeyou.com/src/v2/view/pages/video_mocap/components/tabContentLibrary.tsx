import React from "react";

export default function TabContentLibrary(props: {
  t: Function,
  pageStateCallback: Function
}){
  const { t } = props
  return(
    <div
      className="tab-pane fade py-4"
      id="vmcLibrary"
    >
      <div className="row">
        <div className="col-12">
          <div className="d-flex gap-3">
            <div className="flex-grow-1">
              <input className="form-control w-100" placeholder={t("input.filenamePlaceholder")} />
            </div>
            <button className="btn btn-primary">{t("button.select")}</button>
          </div>
        </div>
        <div className="col-12 py-4">
          <div className="d-flex justify-content-end">
              <button className="btn btn-primary" disabled>{t("button.generate")}</button>
          </div>
        </div>
      </div>
    </div>

  )
}