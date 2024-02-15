import React from "react";

import { useParams, useHistory } from "react-router-dom";
import { useMedia } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { EnqueueVideoWorkflow } from "@storyteller/components/src/api/video_workflow";
import { states, Action, State } from "../../reducer";

export default function pageVSTApp({
  debug, t, pageState, dispatchPageState, parentPath
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  parentPath: string;
  dispatchPageState: (action: Action) => void;
}) {
  return(
    <p>hi</p>
  );
};