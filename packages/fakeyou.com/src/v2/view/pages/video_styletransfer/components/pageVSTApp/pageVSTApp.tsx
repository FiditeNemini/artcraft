import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useParams, useHistory } from "react-router-dom";

import { Button, Panel, TextArea } from "components/common";
import {VideoPlayerQuickTrim} from "components/common/VideoPlayerQuickTrim";
import EnqueueVideoStyleTransfer from "@storyteller/components/src/api/video_styleTransfer";

import { Action, State } from "../../reducer";
import { initialValues } from "./dataDefaultValues";
import { mapRequest, VSTType } from "./helpers";

import CompStyleModal from "./compStyleModal";
import CompAdvanceOptions from "./compAdvanceOptions";
import { CompAdminPanel } from "./compAdminPanel";

export default function PageVSTApp({
  debug: debugProps,
  t,
  pageState,
  dispatchPageState,
  parentPath,
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  parentPath: string;
  dispatchPageState: (action: Action) => void;
}) {
  const debug = debugProps || true;
  const { mediaToken } = useParams<any>();

  const [vstValues, setVstValues] = useState<VSTType>({
    ...initialValues,
    fileToken: pageState.mediaFileToken || mediaToken,
  });

  const handleOnChange = (val: {
    [key: string]:
      number | 
      string | 
      boolean | 
      undefined |
      {[key: string]: number | string}
      ;
  }) => {
    setVstValues(curr => ({ ...curr, ...val }));
  };

  const history = useHistory();
  const handleGenerate = () => {
    if (debug) console.log(vstValues);

    const request = mapRequest(vstValues);
    if (debug) console.log(request);
    EnqueueVideoStyleTransfer(request).then(res => {
      if (res.success && res.inference_job_token) {
        dispatchPageState({
          type: "enqueueJobSuccess",
          payload: {
            inferenceJobToken: res.inference_job_token,
          },
        });
      } else {
        console.log(res);
      }
    });
    dispatchPageState({ type: "enqueueJob" });
    history.push(`${parentPath}/jobs`);
  };

  return (
    <Panel padding={true}>
      <div className="row g-5 mb-4">
        <div className="col-12 col-md-6">
          <VideoPlayerQuickTrim
            trimStartMs={vstValues.trimStart}
            trimEndMs={vstValues.trimEnd}
            mediaToken={vstValues.fileToken}
            onSelectTrim={(val: {
              trimStartMs: number;
              trimEndMs: number;
            }) =>{
              handleOnChange({
                trimStart: val.trimStartMs,
                trimEnd: val.trimEndMs,
              })
            }}
            onResponse={res => {
              dispatchPageState({
                type: "loadFileSuccess",
                payload: {
                  mediaFile: res,
                  mediaFileToken: pageState.mediaFileToken || mediaToken,
                },
              });
            }}
          />
        </div>
        <div className="col-12 col-md-6 d-flex flex-column gap-3">
          <TextArea
            {...{
              label: t("input.label.prompt"),
              placeholder: t("input.placeholder.prompt"),
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleOnChange({ posPrompt: e.target.value }),
              value: vstValues.positivePrompt,
              required: false,
            }}
          />
          <TextArea
            {...{
              label: t("input.label.negPrompt"),
              placeholder: t("input.placeholder.negPrompt"),
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleOnChange({ negPrompt: e.target.value }),
              value: vstValues.negativePrompt,
              required: false,
            }}
          />

          <CompStyleModal
            debug={debug}
            t={t}
            value={vstValues.sdModelTitle}
            onChange={handleOnChange}
          />
          <CompAdvanceOptions
            debug={debug}
            t={t}
            currDefaultCN={vstValues.defaultCN}
            onChange={handleOnChange}
            vstValues={vstValues}
          />
        </div>
      </div>

      <div className="row g-3 mt-4">
        <div className="col-12 d-flex justify-content-between">
          <NavLink to={`${parentPath}`}>
            <Button label={t("button.cancel")} variant="secondary" />
          </NavLink>
          <Button
            label={t("button.enqueue")}
            onClick={handleGenerate}
            variant="primary"
            disabled={vstValues.trimEnd === 0}
          />
        </div>
        {debug && 
          <CompAdminPanel
            parentPath={parentPath}
            dispatchPageState={dispatchPageState}
            vstValues={vstValues}
          />
        }
      </div>
    </Panel>
  );
}
