import React from "react";
import { Redirect, useLocation } from "react-router-dom";

import { BasicVideo, Panel, Tabs } from "components/common";

import { Action, State } from "../storytellerFilterReducer";
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

  //pick default tab using pathname
  const { pathname } = useLocation();
  if (pathname === "/storyteller-filter" || pathname === "/storyteller-filter/") {
    return <Redirect to={"/storyteller-filter/upload"} />;
  }

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