import { TrackClips } from "~/pages/PageEnigma/comps/Timeline/TrackClips";
import {
  audioGroup,
  fullWidth,
  toggleAudioMute,
  updateAudio,
} from "~/pages/PageEnigma/store";

export const Audio = () => {
  const { clips } = audioGroup.value;

  return (
    <div
      className="block rounded-lg bg-audio-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth.value + 90 }}
    >
      <div className="prevent-select mb-5 pt-2 text-xs font-medium text-white">
        Global Audio
      </div>
      <div className="flex flex-col gap-4">
        <TrackClips
          id={audioGroup.value.id}
          clips={clips}
          title="Global Audio TrackClips"
          updateClip={updateAudio}
          style="audio"
          muted={audioGroup.value.muted}
          toggleMute={toggleAudioMute}
        />
      </div>
    </div>
  );
};
