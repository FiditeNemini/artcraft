import { Tabs } from "~/modules/Tabs";
import { TabStyling } from "./TabStyling";

export const SidePanelTabs = ()=>{
  return(
    <Tabs
      tabs={[
        {
          header: "Animation",
          children: <p>Animation Tab</p>,
        },
        {
          header: "Camera",
          children: <p>Camera Tab</p>,
        },
        {
          header: "Audio",
          children: <p>Audio Tab</p>,
        },
        {
          header: "Styling",
          children: <TabStyling />,
        },
      ]}
    />
  );

}