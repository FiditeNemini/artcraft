import SelectModal from "components/common/SelectModal/SelectModal";
import React, {useState} from "react";
import { states, Action, State } from "../videoMocapReducer";
import { Button } from "components/common";

export default function TabContentLibrary({
  t, pageState, dispatchPageState
}: {
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}){
  const [token, setToken] = useState<string|undefined>();
  const handleProceed = ()=>{
    if(token)
      dispatchPageState({
        type: "selectedFile",
        payload: {mediaFileToken: token}
      });
  }
  const handleOnSelect = (token:string)=>{
    setToken(token);
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
      {token && 
        <Button 
          label={t("button.proceed")}
          onClick={handleProceed}
        />
      }
    </div>
  );
}
