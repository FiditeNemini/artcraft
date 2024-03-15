import React from "react";

import { ProgressBar } from "./ProgressBar";

export const ScrubberBar = ({
  debug: propsDebug = false,
  status,
}:{
  debug?: boolean;
  status: string;
})=>{
  const debug = false || propsDebug;
  if (debug) console.log("reRENDERING ------ ScrubberBar");

  return(
    <div className="scrubber-bar">
      <ProgressBar />
    </div>
  );
};