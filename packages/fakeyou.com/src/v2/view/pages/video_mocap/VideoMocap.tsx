import React from "react";
import { useLocalize } from "hooks";

import TabContentUpload from "./components/tabContentUpload";
import TabContentLibrary from "./components/tabContentLibrary";
import { BasicVideo } from "components/common";

export default function VideoMotionCapture(){
  const { t } = useLocalize("VideoMotionCapture");
  
  return (
    <div className="container-panel py-4">
      <div className="panel p-4">
        
        {/*Header section*/}
        <div className="row g-5">
          <h1 className="fw-bold">{t("headings.title")}</h1>
          <p className="fa-light-txt opacity-75 mt-1">{t("headings.subtitle")}</p>
        </div>

        
        <div className="row g-5 mt-1">

          {/*Video Chooser Tabs*/}
          <div className="col-12 col-md-6">
            <ul className="nav nav-tabs" id="vmcTab">
              <li className="nav-item">
                <button
                  className="nav-link active"
                  id="vmcUploadTab"
                  data-bs-toggle="tab"
                  data-bs-target="#vmcUpload"
                >
                  {t("tabTitle.upload")}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link"
                  id="vmcLibraryTab"
                  data-bs-toggle="tab"
                  data-bs-target="#vmcLibrary"
                >
                  {t("tabTitle.library")}
                </button>
              </li>
            </ul>
            <div className="tab-content" id="vmcTabContent">
              <TabContentUpload t={t}/>
              <TabContentLibrary t={t}/>
            </div>
          </div>
          {/*ENDS Video Chooser Tabs*/}
          
          <div className="col-12 col-md-6">
            <BasicVideo />
          </div>

        </div>{/*2nd row*/}

      </div>{/*panel*/}
    </div>
  )
}
