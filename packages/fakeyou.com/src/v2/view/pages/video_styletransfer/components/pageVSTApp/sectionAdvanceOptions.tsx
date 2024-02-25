import React from 'react';

import {
  faFaceViewfinder,
  faPerson,
  faUser,
  faBuildingColumns,
  faText,
  faRotateLeft,
}
from "@fortawesome/pro-solid-svg-icons";

import {
  Button,
  NumberSliderV2
} from 'components/common';
import { WorkflowValuesType } from './helpers';

export default function sectionAdvanceOptions({
  workflowValues: wfVal,
  onChange: handleOnChange
}:{
  workflowValues : WorkflowValuesType,
  onChange: (val:{[key: string]: number|string|boolean|undefined})=>void
}){
  return (
    <>
      <div className="d-flex justify-content-between p-3 w-100">
        <Button icon={faFaceViewfinder} label="Face Closeups"/>
        <Button icon={faUser} label="Half Body Shots"/>
        <Button icon={faPerson} label="Full Body Shots"/>
        <Button icon={faBuildingColumns} label="Architecture or Landscape"/>
        <Button icon={faText} label="Flat Logos, or Typographies"/>
      </div>
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
      <div className="d-flex p-3 justify-content-end">
        <Button icon={faRotateLeft} label="Reset"/>
      </div>
    </>
  );
}