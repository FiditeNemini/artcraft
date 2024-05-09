import { useSignals } from "@preact/signals-react/runtime";

import { faSpinnerThird } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  editorState,
  EditorStates,
  previewSrc,
} from "~/pages/PageEnigma/store/engine";
import {
  timelineHeight,
  sidePanelWidth,
  sidePanelVisible,
} from "~/pages/PageEnigma/store";
import { pageHeight, pageWidth } from "~/store";

import { H3 } from "~/components";

export const PreviewFrameImage = ()=>{
  useSignals();
  if( editorState.value === EditorStates.PREVIEW ){
    if ( previewSrc.value === "" ){
      return (
        <div
          className="absolute inset-0"
          style={{
            width:
              pageWidth.value -
              (sidePanelVisible.value ? sidePanelWidth.value : 0) -
              84,
            height: pageHeight.value - timelineHeight.value - 68,
          }}
        >
          <div
            className="relative w-full h-full flex flex-col justify-center items-center gap-8">
            <span className="absolute w-full h-full bg-black opacity-50"/>
            <FontAwesomeIcon icon={faSpinnerThird} spin size="9x" />
            <H3 className="text-white z-20">Generating Preview...</H3>
          </div>
        </div>
      );
    }else{
      return(
        <img
          className="absolute inset-0"
          src={previewSrc.value}
          id="video-scene"
          style={{
            width:
              pageWidth.value -
              (sidePanelVisible.value ? sidePanelWidth.value : 0) -
              84,
            height: pageHeight.value - timelineHeight.value - 68,
          }}
        />
      );
    }
  }
  return null;
}