import React from "react";

import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { Analytics } from "common/Analytics";
import { inferenceFailures } from "../commons";

import { Panel, Tabs } from "components/common";

import { State, Action } from "../reducer";
import TabContentUpload from "./tabContentUpload";
import TabContentLibrary from "./tabContentLibrary";

export default function PageVideoProvision({
  debug = false,
  parentPath,
  t,
  pageState,
  dispatchPageState,
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
      content: (
        <TabContentUpload
          {...{
            debug,
            t,
            pageState,
            dispatchPageState,
          }}
        />
      ),
      to: `${parentPath}/upload`,
      padding: true,
    },
    {
      label: t("tabTitle.library"),
      content: (
        <TabContentLibrary
          {...{
            debug,
            t,
            pageState,
            dispatchPageState,
          }}
        />
      ),
      to: `${parentPath}/select-media`,
      padding: true,
    },
  ];

  return (
    <>
      <Panel className="mb-4">
        <div className="row g-0">
          <div className="col-12 col-md-6">
            <Tabs tabs={tabs} />
          </div>
          <div className="col-12 col-md-6 p-5 mt-3">
            <p>{t("video.instruction")}</p>
          </div>
        </div>
      </Panel>
      <InferenceJobsList
        {...{
          showNoJobs: false,
          failures: inferenceFailures,
          onSelect: () => Analytics.voiceConversionClickDownload(),
          jobType: FrontendInferenceJobType.VideoStyleTransfer,
        }}
      />
    </>
  );
}
