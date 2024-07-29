import React, { memo } from 'react'
import {
  Checkbox,
  NumberSliderV2,
} from 'components/common'
import { WorkflowValuesType } from './helpers';

export const AdvanceOptionsInitialValues = {
  firstPass: 1,
  upscalePass: 0.42,
  motionScale:1,
  upscaleMultiplier: 1.5,
  useEmptyLatent: false,
  useFaceDetailer: false,
  denoiseFaceDetailer: 0.45,
  useLCM: false,
  lcmCFG: 2,
  lcmSteps: 8,
}

export default memo( function SectionAdvanceOptions({
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
              min: 0.1, max: 1, step: 0.01,
              initialValue: wfVal.firstPass,
              label: " Denoise First Pass",
              thumbTip: "Denoise First Pass",
              onChange: (val)=>{handleOnChange({firstPass:val})}
            }}/>
        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0.1, max: 1, step: 0.01,
            initialValue: wfVal.upscalePass,
            label: "Denoise Upscale Pass",
            thumbTip: "Denoise Upscale Pass",
            onChange: (val)=>{handleOnChange({upscalePass: val})}
          }}/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0.25, max: 2, step: 0.05,
            initialValue: wfVal.motionScale,
            label: "Motion Scale",
            thumbTip: "Motion Scale",
            onChange: (val)=>{handleOnChange({motionScale: val})}
          }}/>
        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 1.5, max: 2, step: 0.5,
            initialValue: wfVal.upscaleMultiplier,
            label: "Upscale Multiplier",
            thumbTip: "Upscale Multiplier",
            onChange: (val)=>{handleOnChange({upscaleMultiplier: val})}
          }}/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <Checkbox 
            label="Use Empty Latent" 
            checked={wfVal.useEmptyLatent}
            onChange={(e:{target:{ checked: boolean, name:string, type: string }})=>{handleOnChange({useEmptyLatent: e.target.checked})}}
          />
        </div>
        <div className="col-md-6">
          <Checkbox 
            label="Use Face Detailer" 
            checked={wfVal.useFaceDetailer}
            onChange={(e:{target:{ checked: boolean, name:string, type: string }})=>{handleOnChange({useFaceDetailer: e.target.checked})}}
          />
        </div>
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">

        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 0.1, max: 0.7, step: 0.01,
            initialValue: wfVal.denoiseFaceDetailer,
            label: "Denoise Face Detailer",
            thumbTip: "Denoise Face Detailer",
            onChange: (val)=>{handleOnChange({denoiseFaceDetailer: val})}
          }}/>
        </div>
      </div>
      <div className="row g-3 p-3">
        <Checkbox 
          label="Use LCM" 
          checked={wfVal.useLCM}
          onChange={(e:{target:{ checked: boolean, name:string, type: string }})=>{handleOnChange({useLCM: e.target.checked})}}
        />
      </div>
      <div className="row g-3 p-3">
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 1, max: 10, step: 1,
            initialValue: wfVal.lcmCFG,
            withRevert: true,
            label: "LCM CFG",
            thumbTip: "LCM CFG",
            onChange: (val)=>{handleOnChange({lcmCFG: val})}
          }}/>
        </div>
        <div className="col-md-6">
          <NumberSliderV2 {...{
            min: 5, max: 15, step: 1,
            initialValue: wfVal.lcmSteps,
            label: "LCM Steps",
            thumbTip: "LCM Steps",
            onChange: (val)=>{handleOnChange({lcmSteps: val})}
          }}/>
        </div>
      </div>
    </>
  );
});