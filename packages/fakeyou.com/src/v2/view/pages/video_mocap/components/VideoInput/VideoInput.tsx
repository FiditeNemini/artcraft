import React, { useEffect } from "react";
import { useSpring } from '@react-spring/web';
import { FileDetails, FileWrapper, FileLabel } from "components/common";
import { faFileVideo } from "@fortawesome/pro-solid-svg-icons";
import "./style.scss";

interface Props {
  //blob, clear, file, inputProps comes from file
  blob?: string,
  clear?: (file?: any) => void,
  file?: any,
  hideActions?: boolean,
  hideClearDetails?: boolean,
  inputProps?: any,
  onStateChange?: () => void,
  success?: boolean,
  submit?: () => void,
  working?: boolean,
  t: Function,
  [x:string]: any,
}

export default function UploadFieldVideo({
  blob = "",
  clear = ()=>{},
  file,
  hideActions,
  hideClearDetails,
  inputProps,
  onStateChange = ()=>{},
  success = false,
  submit = ()=>{},
  working = false,
  t,
  ...rest }: Props)
{
  useEffect(()=>{
    //only fire for file unload
    //on file load is fired in video elements
    if (!file) onStateChange();
  }, [file, onStateChange])

  const style = useSpring({
    config: { mass: 1, tension: 120, friction: 14 }
  });
  
  const fileTypes = ["MP4"];

  return <FileWrapper {...{ fileTypes, panelClass: "ratio-1x1", ...inputProps, ...rest }}>
    <div className="d-flex justify-content-center align-items-center w-100 h-100 overflow-hidden">
      { file ?
        <>
          <FileDetails
            className="
              position-absolute top-0
              d-flex w-100 p-3
            "
            {...{ clear, file, hideClearDetails, icon: faFileVideo }}
          />
          <video
            controls
            src={blob}
            className="mh-100 mw-100 object-fit-cover"
            onLoadStart={onStateChange}
            {...{style}}
          />
          
        </> :
        <>
          <FileLabel className="
              upload-details
              position-absolute top-0
              d-flex w-100 p-3
            " 
            {...{ fileTypes }}
          />
          {/* this is the fontAwesome faVideo */}
          <svg className="fill-secondary" xmlns="http://www.w3.org/2000/svg" height="160" width="200" viewBox="0 0 576 512"><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z"/></svg>
        </>
      }
    </div>
  </FileWrapper>;
};