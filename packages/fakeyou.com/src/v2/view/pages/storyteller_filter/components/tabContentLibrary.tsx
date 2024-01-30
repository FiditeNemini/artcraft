import SelectModal from "components/common/SelectModal/SelectModal";
import React from "react";
import { states, Action, State } from "../storytellerFilterReducer";
import { Button } from "components/common";
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
  const handleOnSelect = (token:string)=>{
    dispatchPageState({
      type: "selectedFile",
      payload: {mediaFileToken: token}
    });
  };
  return (
    <div>
      <SelectModal
        modalTitle="Select a Video"
        label="Select a Video"
        onSelect={handleOnSelect}
        tabs={[
          {
            label: "All Videos",
            tabKey: "allVideos",
            mediaTypeFilter: "video",
            searcher: false,
            type: "media",
          },
        ]}
      />
      {pageState.status === states.FILE_SELECTED && 
        <Button 
          label={t("button.proceed")}
          onClick={handleProceed}
        />
      }
    </div>
  );
}
