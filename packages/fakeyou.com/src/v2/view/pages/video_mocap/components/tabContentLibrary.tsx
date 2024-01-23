import React from "react";

import SelectSearcher from "components/common/SelectSearcher/SelectSearcher";
import { Action, State } from "../videoMocapReducer";

export default function TabContentLibrary(props: {
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}){
  return (
    <div>
      <SelectSearcher
        modalTitle="Select a Video"
        label="Select a Video"
        tabs={[
          {
            label: "All Videos",
            searcherKey: "allVideos",
            mediaTypeFilter: "",
          },
          {
            label: "Bookmarked",
            searcherKey: "bookmarkedVideos",
            mediaTypeFilter: "",
          },
        ]}
      />
    </div>
  );
}
