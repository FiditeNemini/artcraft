import { TrackClips } from "~/pages/PageEnigma/comps/Timeline/TrackClips";
import { audioGroup, fullWidth, updateAudio } from "~/pages/PageEnigma/store";
import { ClipGroup } from "~/pages/PageEnigma/models";

export const Audio = () => {
  const { clips } = audioGroup.value;

  return (
    <div
      className="block rounded-r-lg bg-global_audio-groupBg pb-5 pr-4"
      style={{ width: fullWidth.value + 16 }}
    >
      <div className="flex flex-col gap-4 pt-4">
        <TrackClips
          id={audioGroup.value.id}
          clips={clips}
          title="Global Audio TrackClips"
          updateClip={updateAudio}
          group={ClipGroup.GLOBAL_AUDIO}
        />
      </div>
    </div>
  );
};
