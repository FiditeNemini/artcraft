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
  Accordion,
  Button,
  Label,
  NumberSliderV2
} from 'components/common';
import { VSTType } from './helpers';

export default function sectionAdvanceOptions({
  vstValues: vstVal,
  onChange: handleOnChange
}:{
  vstValues : VSTType,
  onChange: (val:{[key: string]: number|string|boolean|undefined})=>void
}){
  return (
    <>
      <Label label="Video's Camera Angle"/>
      <div className="d-flex justify-content-between w-100">
        <Button icon={faFaceViewfinder} label="Face Closeups"/>
        <Button icon={faUser} label="Half Body Shots"/>
        <Button icon={faPerson} label="Full Body Shots"/>
        <Button icon={faBuildingColumns} label="Architecture or Landscape"/>
        <Button icon={faText} label="Flat Logos, or Typographies"/>
      </div>
      <Accordion className="mt-4">
        <Accordion.Item title={"Advanced Options"}>
          <div className="row g-3 p-3">
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnCanny,
                label: "Canny",
                thumbTip: "Canny",
                onChange: (val)=>{handleOnChange({cnCanny: val})}
                }}/>
            </div>
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnLinearAnime,
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
                initialValue: vstVal.cnDepth,
                label: "Depth",
                thumbTip: "Depth",
                onChange: (val)=>{handleOnChange({cnDepth: val})}
                }}/>
            </div>
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnOpenPose,
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
                initialValue: vstVal.cnPipeFace,
                label: "Media Pipe Face",
                thumbTip: "Media Pipe Face",
                onChange: (val)=>{handleOnChange({cnPipeFace: val})}
                }}/>
            </div>
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnSparseScribble,
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
                initialValue: vstVal.cnLinearRealistic,
                label: "Video CN (Linear Realistic)",
                thumbTip: "Video CN",
                onChange: (val)=>{handleOnChange({cnLinearRealistic: val})}
                }}/>
            </div>
          </div>
          <div className="d-flex p-3 justify-content-end">
            <Button icon={faRotateLeft} label="Reset"/>
          </div>
        </Accordion.Item>
      </Accordion>
    </>
  );
}