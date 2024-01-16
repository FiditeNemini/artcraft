import React from "react";

export default function TabContentLibrary(props: {
  t: Function
}){
  const { t } = props
  return(
    <div
      className="tab-pane fade"
      id="vmcLibrary"
    >
      <div className="row">
        <div className="col-12">
          <div className="d-flex py-3">
            <div className="flex-grow-1">
              <input className="form-control w-100" placeholder={t("input.filenamePlaceholder")} />
            </div>
            <button className="btn btn-primary m-1">{t("button.select")}</button>
          </div>

          <div className="d-flex justify-content-end">
              <button className="btn btn-primary m-1" disabled>{t("button.generate")}</button>
          </div>
        </div>
      </div>
    </div>

  )
}