import React from "react";

import { BasicVideo, Panel, Tabs } from "components/common";

import { State, Action } from "../videoWorkflowReducer";
import TabContentUpload from "./tabContentUpload";
import TabContentLibrary from "./tabContentLibrary";

export default function PageVideoProvision({
  debug=false, parentPath, t, pageState, dispatchPageState
}: {
  debug?: boolean;
  parentPath: string;
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}) {

  const tabs = [
    {
      label: t("tabTitle.upload"),
      content: <TabContentUpload {...{
        debug, t, pageState, dispatchPageState
      }} />,
      to: `${parentPath}/upload`,
      padding: true,
    },
    {
      label: t("tabTitle.library"),
      content: <TabContentLibrary {...{
        debug, t, pageState, dispatchPageState
      }} />,
      to: `${parentPath}/select-media`,
      padding: true,
    },
  ];

  return(
    <Panel>
      <div className="row g-0">
        <div className="col-12 col-md-6">
          <Tabs tabs={tabs} />
        </div>
        <div className="col-12 col-md-6">
          <Panel padding={true} clear={true}>
            <BasicVideo
              title={t("video.sample")}
              src="/videos/face-animator-instruction-en.mp4"
            />
          </Panel>
        </div>
      </div>
    </Panel>
  );
}