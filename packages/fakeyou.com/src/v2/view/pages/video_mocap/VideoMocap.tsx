import React from "react";
import { useLocalize } from "hooks";

import TabContentUpload from "./components/tabContentUpload";
import TabContentLibrary from "./components/tabContentLibrary";

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
          <div className="col-12 col-lg-6 d-flex flex-column gap-4">
            <ul className="nav nav-tabs nav-vc" id="vmcTab">
              <li className="nav-item w-100">
                <button
                  className="nav-link active w-100"
                  id="vmcUploadTab"
                  data-bs-toggle="tab"
                  data-bs-target="#vmcUpload"
                >
                  {t("tabTitle.upload")}
                </button>
              </li>
              <li className="nav-item w-100">
                <button
                  className="nav-link w-100"
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
          </div> {/*Chooser Tabs*/}

        </div>{/*2nd row*/}

      </div>{/*panel*/}
    </div>
  )
}