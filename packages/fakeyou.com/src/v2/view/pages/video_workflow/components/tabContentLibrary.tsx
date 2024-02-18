import React from "react";
import { NavLink } from "react-router-dom";
import { states, Action, State } from "../videoWorkflowReducer";
import { Button } from "components/common";
import SelectModalVideoTabs from "components/common/SelectModalVideoTabs";
import { SelectModalData } from "components/common/SelectModal/SelectModalV2";
import VideoFakeyou from "components/common/VideoFakeyou";

export default function TabContentLibrary({
  t, pageState, dispatchPageState
}: {
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}){
  const handleProceed = ()=>{
    dispatchPageState({type: "loadFile"})
  }
  const handleOnSelect = (data:SelectModalData)=>{
    if (data.token !== ""){
      dispatchPageState({
        type: "selectedFile",
        payload: {mediaFileToken: data.token}
      });
    }else{
      dispatchPageState({type: "clearedFile"});
    };
  };

  return (
    <div className="row g-3">
      <div className="col-12">
        <SelectModalVideoTabs
          value={pageState.mediaFileToken}
          modalTitle="Select a Video"
          inputLabel="Select a Video"
          onSelect={handleOnSelect}
        />
        {pageState.mediaFileToken && 
          <VideoFakeyou mediaToken={pageState.mediaFileToken} />
        }
      </div>
      {pageState.status === states.FILE_SELECTED &&
        <div className="col-12 d-flex justify-content-center mt-5">
          <NavLink to={`load/${pageState.mediaFileToken}`}>
            <Button 
              label={t("button.proceed")}
              onClick={handleProceed}
            />
          </NavLink>
        </div>
      }
    </div>
  );
}
