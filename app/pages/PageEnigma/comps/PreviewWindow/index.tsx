import { useContext } from "react"
import { EngineContext } from "~/contexts/EngineContext"

export const PreviewWindow = ()=>{
  const editorEngine = useContext(EngineContext);
  //take data from egine context

  return (
    <div
      id="preview-window"
      className="absolute bottom-0 w-30 m-4"
    >
      <div className="relative">
        <div
          id="preview-window-label"
          className="text-white bg-ui-panel pt-1 px-2 pb-3 -z-10 rounded-t-lg -mb-2 w-fit"
        >
          <p>Camera View</p>
        </div>
        <div className="rounded-lg border border-white box overflow-hidden">
          <img
            //shoot that datat from engine context to this image
            className="aspect-video max-h-40" 
            src="/resources/uiAssets/video_player_placeholder.gif"
          />
        </div>
      </div>
    </div>
  )
}