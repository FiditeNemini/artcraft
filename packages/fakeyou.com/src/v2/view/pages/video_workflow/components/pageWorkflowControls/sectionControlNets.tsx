import React, { memo } from 'react'
import { NumberSliderV2 } from 'components/common'
import { WorkflowValuesType } from './helpers';

export const ControlNetsInitialValues = {
  cnCanny: 0,
  cnDepth: 0,
  cnLinearAnime: 0,
  cnLinearRealistic: 0,
  cnOpenPose: 0,
  cnPipeFace: 0,
  cnSparse: 0.7,
  cnTile: 0.7,
}

export default memo( function SectionControlNets({
  workflowValues: wfVal, 
  onChange : handleOnChange
} : {
  workflowValues : WorkflowValuesType
  onChange: (val:{[key: string]: number|string|boolean})=>void}
){

  return(
    <>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: 1, step: 0.1,
            initialValue: wfVal.cnCanny,
            label: "Canny",
            thumbTip: "Canny",
            onChange: (val)=>{handleOnChange({cnCanny: val})}
            }}/>
        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: 1, step: 0.1,
            initialValue: wfVal.cnLinearAnime,
            label: "Line Art Anime",
            thumbTip: "Line Art Anime",
            onChange: (val)=>{handleOnChange({cnLinearAnime: val})}
            }}/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: 1, step: 0.1,
            initialValue: wfVal.cnDepth,
            label: "Depth",
            thumbTip: "Depth",
            onChange: (val)=>{handleOnChange({cnDepth: val})}
            }}/>
        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: 1, step: 0.1,
            initialValue: wfVal.cnOpenPose,
            label: "OpenPose",
            thumbTip: "OpenPose",
            onChange: (val)=>{handleOnChange({cnOpenPose: val})}
            }}/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: 1, step: 0.1,
            initialValue: wfVal.cnPipeFace,
            label: "Media Pipe Face",
            thumbTip: "Media Pipe Face",
            onChange: (val)=>{handleOnChange({cnPipeFace: val})}
            }}/>
        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: 1, step: 0.1,
            initialValue: wfVal.cnSparse,
            label: "Sparse Scribble",
            thumbTip: "Sparse Scribble",
            onChange: (val)=>{handleOnChange({cnSparse: val})}
            }}/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: 1, step: 0.1,
            initialValue: wfVal.cnLinearRealistic,
            label: "Video CN (Linear Realistic)",
            thumbTip: "Video CN",
            onChange: (val)=>{handleOnChange({cnLinearRealistic: val})}
            }}/>
        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0, max: 1, step: 0.1,
            initialValue: wfVal.cnTile,
            label: "Tile CN",
            thumbTip: "Tile CN",
            onChange: (val)=>{handleOnChange({cnTile: val})}
            }}/>
        </div>
      </div>
    </>
  );
});