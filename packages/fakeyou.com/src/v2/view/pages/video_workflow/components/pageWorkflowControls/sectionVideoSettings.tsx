import React, { memo, useState } from 'react'

import { TempInput as Input } from 'components/common'

export const VideoSettingsInitialValues = {
  width: 544,
  height: 544,
  framesCap: 16,
  skipFrames: 0,
  everyNthFrame: 2,
  inputFps: 24,
  interpolationMultiplier: 2,
}

export default memo( function SectionVideoSettings({
  onChange : handleOnChange,
  videoElement: ve
} : {
  onChange: (key:string, val:number)=>void,
  videoElement: HTMLVideoElement | null,
}){
  const iv = VideoSettingsInitialValues;
  const [{width, height}, setDimensions] = useState({
    width:iv.width, height:iv.height
  });
  if(ve && ve!==null){
    ve.onloadedmetadata = () =>{
      if (ve.videoWidth && ve.videoHeight) {
        const aspectRatio = ve.videoWidth/ve.videoHeight
        if (aspectRatio > 1){
          setDimensions({width: 960, height: iv.height});
        }
        else if (aspectRatio < 1) {
          setDimensions({width: iv.width, height: 960});
        }else{
          console.log(`aspectRaio: ${aspectRatio}`);
        }
      }
    }
  }
  return(
    <>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <Input label="Width" value={width} readOnly/>
        </div>
        <div className="col-md-6">
          <Input label="Height" value={height} readOnly/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <Input label="Frames Cap" value={iv.framesCap} readOnly/>
        </div>
        <div className="col-md-6">
          <Input label="Skip Frames" value={iv.skipFrames} readOnly/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <Input label="Every n-th Frame" value={iv.everyNthFrame} readOnly />
        </div>
        <div className="col-md-6">
          <Input label="Input FPS" value={iv.inputFps} readOnly/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <Input
            label="Interpolation Multiplier" 
            value={iv.interpolationMultiplier}
            readOnly
          />
        </div>
        <div className="col-md-6">
        </div>
      </div>
    </>
  );
});