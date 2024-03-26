import {
  useEffect,
  useState,
} from "react"

export const ViewSideBySide = ()=>{

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
          <img
            //shoot that datat from engine context to this image
            className="aspect-video max-h-150" 
            src="/resources/uiAssets/video_player_placeholder.gif"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center items-center">
        <div className="text-white">
          <label>Stylized Preview</label>
        </div>
        <div className="relative">
          <img
            //shoot that datat from engine context to this image
            className="aspect-video max-h-150" 
            src="/resources/uiAssets/video_player_placeholder.gif"
          />
        </div>
      </div>
    </div>
  )
}