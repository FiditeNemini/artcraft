import React from "react";
import TabContentUpload from "./tabContentUpload";
import TabContentLibrary from "./tabContentLibrary";

export function PageVideoProvision (props:{
  t: Function
  pageStateCallback: (data:{tokenType:string, token:string | undefined}) => void
}){
  const {t} = props;
  return(<>
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
          disabled
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
      <TabContentUpload {...props}/>
      <TabContentLibrary {...props}/>
    </div>
  </>);
}