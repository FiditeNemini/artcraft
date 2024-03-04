import React, { useState } from "react";

import {
  faBuildingColumns,
  faFaceViewfinder,
  faPerson,
  // faRotateLeft,
  faStar,
  // faSparkles,
  faText,
  faUser,
} from "@fortawesome/pro-solid-svg-icons";

import {
  // Accordion,
  Button,
  Label,
  // NumberSliderV2
} from "components/common";
import { VSTType } from "./helpers";
import {
  CNPreset,
  closeupPreset,
  halfbodyPreset,
  fullbodyPreset,
  landscapePreset,
  typogPreset,
  defaultPreset,
} from "./dataCnPresets";

export default function SectionAdvanceOptions({
  debug,
  t,
  vstValues: vstVal,
  onChange: handleOnChange,
}: {
  debug?: boolean;
  t: Function;
  vstValues: VSTType;
  onChange: (val: {
    [key: string]: number | string | boolean | undefined;
  }) => void;
}) {
  const [preset, pickPreset] = useState<CNPreset>("default");
  function handlePreset(newPreset: CNPreset) {
    switch (newPreset) {
      case "closeup":
        handleOnChange(closeupPreset);
        break;
      case "halfbody":
        handleOnChange(halfbodyPreset);
        break;
      case "fullbody":
        handleOnChange(fullbodyPreset);
        break;
      case "landscape":
        handleOnChange(landscapePreset);
        break;
      case "typog":
        handleOnChange(typogPreset);
        break;
      case "custom":
      default:
        handleOnChange(defaultPreset);
        break;
    }
    pickPreset(newPreset);
  }
  return (
    <div>
      <Label label="Video's Camera Angle" />
      {/* <div className="d-flex flex-wrap w-100">
        <div className="my-1 me-1">
          <Button
            icon={faStar}
            label="Default"
            isActive={preset==='default'}
            onClick={()=>handlePreset('default')}
          />
        </div>
         <div className="my-1 me-1">
          <Button
            icon={faSparkles}
            label="Custom"
            isActive={preset==='custom'}
            disabled
          />
        </div> 
      </div> */}
      <div className="d-flex flex-wrap w-100">
        <div className="m-1">
          <Button
            icon={faStar}
            label="Default"
            isActive={preset === "default"}
            onClick={() => handlePreset("default")}
          />
        </div>
        <div className="m-1">
          <Button
            icon={faFaceViewfinder}
            label="Face Closeups"
            isActive={preset === "closeup"}
            onClick={() => handlePreset("closeup")}
          />
        </div>
        <div className="m-1">
          <Button
            icon={faUser}
            label="Half Body Shots"
            isActive={preset === "halfbody"}
            onClick={() => handlePreset("halfbody")}
          />
        </div>
        <div className="m-1">
          <Button
            icon={faPerson}
            label="Full Body Shots"
            isActive={preset === "fullbody"}
            onClick={() => handlePreset("fullbody")}
          />
        </div>
        <div className="m-1">
          <Button
            icon={faBuildingColumns}
            label="Architecture or Landscape"
            isActive={preset === "landscape"}
            onClick={() => handlePreset("landscape")}
          />
        </div>
        <div className="m-1">
          <Button
            icon={faText}
            label="Flat Logos, or Typographies"
            isActive={preset === "typog"}
            onClick={() => handlePreset("typog")}
          />
        </div>
      </div>
      {/* <Accordion className="mt-4">
        <Accordion.Item title={"Advanced Options"}>
          <div className="row g-3 p-3">
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnCanny,
                label: "Canny",
                thumbTip: "Canny",
                onChange: (val)=>{
                  handleOnChange({cnCanny: val});
                  pickPreset('custom');
                }
              }}/>
            </div>
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnDepth,
                label: "Depth",
                thumbTip: "Depth",
                onChange: (val)=>{
                  handleOnChange({cnDepth: val});
                  pickPreset('custom');
                }
              }}/>
            </div>

          </div>
          <div className="row g-3 p-3">
          <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnLineArtAnime,
                label: "Line Art - Anime",
                thumbTip: "Line Art - Anime",
                onChange: (val)=>{
                  handleOnChange({cnLineArtAnime: val});
                  pickPreset('custom');
                }
              }}/>
            </div>
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnLineArtRealistic,
                label: "Line Art - Realistic",
                thumbTip: "Line Art - Realistic)",
                onChange: (val)=>{
                  handleOnChange({cnLineArtRealistic: val});
                  pickPreset('custom');
                }
              }}/>
            </div>
          </div>
          <div className="row g-3 p-3">
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnOpenPose,
                label: "OpenPose",
                thumbTip: "OpenPose",
                onChange: (val)=>{
                  handleOnChange({cnOpenPose: val});
                  pickPreset('custom');
                }
              }}/>
            </div>
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnPipeFace,
                label: "Media Pipe Face",
                thumbTip: "Media Pipe Face",
                onChange: (val)=>{
                  handleOnChange({cnPipeFace: val})
                  pickPreset('custom');
                }
              }}/>
            </div>
          </div>
          <div className="row g-3 p-3">
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnSparseScribble,
                label: "Sparse Scribble",
                thumbTip: "Sparse Scribble",
                onChange: (val)=>{
                  handleOnChange({cnSparseScribble: val})
                  pickPreset('custom');
                }
              }}/>
            </div>
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 0, max: 1, step: 0.1,
                initialValue: vstVal.cnSoftEdge,
                label: "Soft Edge",
                thumbTip: "SoftEdge",
                onChange: (val)=>{
                  handleOnChange({cnSoftEdge: val});
                  pickPreset('custom');
                }
              }}/>
            </div>
          </div>
          {/* <div className="row g-3 p-3">
            <div className="col-md-6">
              <NumberSliderV2 {...{
                min: 1, max: 64, step: 1,
                initialValue: vstVal.cnRegularSteps,
                label: "Regular Steps",
                thumbTip: "Regular Steps",
                onChange: (val)=>{
                  handleOnChange({cnRegularSteps: val});
                  pickPreset('custom');
                }
              }}/>
            </div>
          </div> 
          <div className="d-flex p-3 justify-content-end">
            <Button
              icon={faRotateLeft}
              label="Reset to Default"
              onClick={()=>{
                handlePreset('default');
                pickPreset('default');
              }}
            />
          </div>
        </Accordion.Item>
      </Accordion> */}
    </div>
  );
}
