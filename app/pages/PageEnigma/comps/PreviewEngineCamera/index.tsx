import { useContext, useEffect, useState } from "react"
import { EngineContext } from "../../contexts/EngineContext"

import { LoadingDotsTyping } from "~/components";
export const PreviewEngineCamera = ()=>{
  const editorEngine = useContext(EngineContext);
  //take data from egine context

  const [showLoader, setShowLoader] = useState<boolean>(true);
  useEffect(()=>{
    setTimeout(()=>setShowLoader(false), 500);
  },[]);
  return (
    <div
      id="preview-engine-camera"
      className="absolute bottom-0 w-30 m-4"
    >
      <div className="relative">
        <div
          className="text-white bg-ui-panel pt-1 px-2 pb-3 -z-10 rounded-t-lg -mb-2 w-fit"
        >
          <p>Camera View</p>
        </div>
        <div className="relative rounded-lg border border-white box overflow-hidden">
          
          <img
            //shoot that datat from engine context to this image
            className="aspect-video max-h-40" 
            src="/resources/uiAssets/video_player_placeholder.gif"
          />
          <div className="absolute w-full h-full top-0 left-0">
            <LoadingDotsTyping isShowing={showLoader}/>
          </div>
        </div>
      </div>
    </div>
  )
}