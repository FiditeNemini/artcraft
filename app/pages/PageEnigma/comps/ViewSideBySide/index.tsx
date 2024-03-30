import { useEffect, useState, useContext } from "react";

import { LoadingDotsBricks } from "~/components";
import { EngineContext } from "../../contexts/EngineContext";

export const ViewSideBySide = ()=>{
  const [showLoader, setShowLoader] = useState(true);
  const editorEngine = useContext(EngineContext);

  useEffect(()=>{
    editorEngine?.generateFrame();
    setTimeout(()=>setShowLoader(false), 200);
  },[ ]);

  return (
    <div
      id="view-side-by-side"
      className="absolute top-0 left-0 w-full h-full flex justify-center items-center gap-2 p-2"
    >
      <div className="flex flex-col justify-center items-center">
        <div className="text-white">
          <label>Raw Preview</label>
        </div>
        <div className="relative">
        <img className="aspect-video max-h-150 border" id="raw-preview"></img>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center">
        <div className="text-white">
          <label>Stylized Preview</label>
        </div>
        <div className="relative">
        <img className="aspect-video max-h-150 border" id="stylized-preview"></img>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full">
        <LoadingDotsBricks isShowing={showLoader}/>
      </div>
    </div>
  )
}