import SelectModal from "components/common/SelectModal/SelectModal";
import React from "react";
import { Action, State } from "../videoMocapReducer";

export default function TabContentLibrary(props: {
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}){
  return (
    <div>
      <SelectModal
        modalTitle="Select a Video"
        label="Select a Video"
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
    </div>
  );
}
