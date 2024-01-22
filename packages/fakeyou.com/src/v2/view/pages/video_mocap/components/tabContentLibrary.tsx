import SelectSearcher from "components/common/SelectSearcher/SelectSearcher";
import React from "react";

export default function TabContentLibrary(props: {
  t: Function;
  pageStateCallback: Function;
}) {
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
