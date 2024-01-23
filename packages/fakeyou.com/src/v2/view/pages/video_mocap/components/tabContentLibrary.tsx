import SelectModal from "components/common/SelectModal/SelectModal";
import React from "react";

export default function TabContentLibrary(props: {
  t: Function;
  pageStateCallback: Function;
}) {
  return (
    <div>
      <SelectModal
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
