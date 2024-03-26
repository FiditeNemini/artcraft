import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";

export const Audio = () => {
  const { audio, updateAudio, toggleAudioMute, fullWidth } =
    useContext(TrackContext);
  const { clips } = audio!;

  return (
    <div
      className="bg-audio-groupBg block rounded-lg pb-5 pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="prevent-select mb-5 pt-2 text-xs font-medium text-white">
        Global Audio
      </div>
      <div className="flex flex-col gap-2">
        <Track
          clips={clips}
          title="Global Audio Track"
          updateClip={updateAudio}
          style="audio"
          muted={audio?.muted}
          toggleMute={toggleAudioMute}
        />
      </div>
    </div>
  );
};
