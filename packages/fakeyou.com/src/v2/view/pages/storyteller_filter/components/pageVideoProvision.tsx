import React from "react";

import { BasicVideo, Panel, Tabs } from "components/common";

import { State, Action } from "../storytellerFilterReducer";
import TabContentUpload from "./tabContentUpload";
import TabContentLibrary from "./tabContentLibrary";

export default function PageVideoProvision({
  debug=false, t, pageState, dispatchPageState
}: {
  debug?: boolean;
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
      to: "/storyteller-filter/upload",
      padding: true,
    },
    {
      label: t("tabTitle.library"),
      content: <TabContentLibrary {...{
        debug, t, pageState, dispatchPageState
      }} />,
      to: "/storyteller-filter/select-media",
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