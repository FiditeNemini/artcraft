import { AudioTabPages, V2VState } from "./types";
import { faChevronRight} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Label, H4, H6 } from "~/components";
export const PageVoicetoVoice = ({
  changePage,
  sessionToken,
  v2vState,
  setV2VState,
}:{
  changePage: (newPage:AudioTabPages) => void;
  sessionToken: string;
  v2vState : V2VState;
  setV2VState : (newState:V2VState)=>void,
}) => {

  return (
    <>
      <Label className="mb-1">Select a Voice</Label>
      <div
        className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center gap-3 cursor-pointer"
        onClick={()=>changePage(AudioTabPages.SELECT_V2V_MODEL)}
      >
        <span className="bg-brand-secondary-600 rounded-lg w-12 h-12"/>
        <div className="grow">
          {!v2vState.voice && <H4>None Selected</H4>}
          {v2vState.voice && <>
            <H4>{v2vState.voice.title}</H4>
            <H6>by {v2vState.voice.creator.display_name}</H6>
          </>}
        </div>
        <FontAwesomeIcon icon={faChevronRight} size="2x"/>
      </div>
    </>
  );
}