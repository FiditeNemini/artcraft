import { TrackClips } from "~/pages/PageEnigma/comps/Timeline/TrackClips";
import {
  audioGroup,
  audioMinimized,
  fullWidth,
  minimizeIconPosition,
  updateAudio,
} from "~/pages/PageEnigma/store";
import { ClipGroup } from "~/pages/PageEnigma/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/pro-solid-svg-icons";
import { useSignals } from "@preact/signals-react/runtime";

export const Audio = () => {
  useSignals();
  const { clips } = audioGroup.value;

  if (audioMinimized.value) {
    return (
      <div
        className="relative flex h-[35px] items-center justify-end rounded-r-lg bg-global_audio-groupBg pr-4"
        style={{ width: fullWidth.value + 16 }}>
        <button
          className="absolute"
          style={{
            left: minimizeIconPosition.value,
          }}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            audioMinimized.value = !audioMinimized.value;
          }}>
          <FontAwesomeIcon icon={faAngleDown} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative block rounded-r-lg bg-global_audio-groupBg pb-5 pr-4"
      style={{ width: fullWidth.value + 16 }}>
      <button
        className="absolute"
        style={{
          left: minimizeIconPosition.value,
        }}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          audioMinimized.value = !audioMinimized.value;
        }}>
        <FontAwesomeIcon icon={faAngleUp} />
      </button>
      <div className="pt-[47px]">
        <TrackClips
          id={audioGroup.value.id}
          clips={clips}
          updateClip={updateAudio}
          group={ClipGroup.GLOBAL_AUDIO}
        />
      </div>
    </div>
  );
};
