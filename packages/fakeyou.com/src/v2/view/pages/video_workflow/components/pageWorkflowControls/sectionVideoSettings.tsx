import React, { memo } from 'react'
import { TempInput as Input, NumberSliderV2 } from 'components/common'
import { WorkflowValuesType } from './helpers';

export const VideoSettingsInitialValues = {
  width: 544,
  height: 544,
  maxFrames: 17,
  framesCap: 16,
  skipFrames: 0,
  everyNthFrame: 2,
  inputFps: 24,
  interpolationMultiplier: 2,
}

export default memo( function SectionVideoSettings({
  onChange : handleOnChange,
  workflowValues: wfVal,
  videoElement: ve
} : {
  onChange: (val:{[key: string]: number|string|boolean|undefined})=>void,
  workflowValues: WorkflowValuesType,
  videoElement: HTMLVideoElement | null,
}){
  const iv = VideoSettingsInitialValues;

  const handleFramesCap = (newValue: number)=>{
    if(newValue - wfVal.skipFrames >= 16)
    handleOnChange({framesCap:newValue});
  }
  const handleSkipFrames = (newValue: number)=>{
    if(wfVal.framesCap - newValue >= 16)
    handleOnChange({skipFrames:newValue});
  }

  if(ve && ve!==null){
    ve.onloadedmetadata = () =>{
      const newValues : {
        width?: number;
        height?: number;
        maxFrames?: number;
        framesCap?: number;
      } = {};
      if (ve.videoWidth && ve.videoHeight) {
        const aspectRatio = ve.videoWidth/ve.videoHeight
        if (aspectRatio > 1) newValues.width = 960;
        else if (aspectRatio < 1) newValues.height = 960
        else console.log(`aspectRaio: ${aspectRatio}`);
      }
      if(ve.duration){
        newValues.maxFrames = Math.floor(ve.duration)*wfVal.inputFps;
        newValues.framesCap =  newValues.maxFrames;
      }
      handleOnChange(newValues);
    }
  }
  return(
    <>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <Input label="Width" value={wfVal.width} readOnly/>
        </div>
        <div className="col-md-6">
          <Input label="Height" value={wfVal.height} readOnly/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 16, max: wfVal.maxFrames, step: 1,
            value: wfVal.framesCap,
            label: "Frames Cap",
            thumbTip: "24 frames = 1 sec",
            onChange: handleFramesCap
          }}/>
        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: wfVal.maxFrames-16, step: 1,
            value: wfVal.skipFrames,
            label: "Skip Frames",
            thumbTip: "24 frames = 1 sec",
            onChange: handleSkipFrames
          }}/>
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