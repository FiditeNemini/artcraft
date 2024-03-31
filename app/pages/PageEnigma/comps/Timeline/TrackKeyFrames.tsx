import { Keyframe } from "~/pages/PageEnigma/models/track";
import { filmLength } from "~/pages/PageEnigma/store";
import { TrackKeyFrame } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrame";

interface Props {
  id: string;
  keyframes: Keyframe[];
  title: string;
  style: "character" | "audio" | "camera" | "objects";
  toggleMute?: () => void;
  muted?: boolean;
  updateKeyframe: (options: { id: string; offset: number }) => void;
}

export const TrackKeyFrames = ({
  id,
  keyframes,
  updateKeyframe,
  title,
  style,
}: Props) => {
  return (
    <div className="pl-16">
      <div
        id={`track-${style}-${id}`}
        className={`relative mt-4 block h-9 w-full rounded-lg bg-${style}-unselected`}
      >
        {keyframes.map((keyframe, index) => (
          <TrackKeyFrame
            key={keyframe.keyframe_uuid}
            min={index > 0 ? keyframes[index - 1].offset + 1 : 0}
            max={
              index < keyframes.length - 1
                ? keyframes[index + 1].offset
                : filmLength.value * 60
            }
            style={style}
            updateKeyframe={updateKeyframe}
            keyframe={keyframe}
          />
        ))}
        <div className="prevent-select absolute ps-2 pt-1 text-xs font-medium text-white">
          {title}
        </div>
      </div>
    </div>
  );
};
