import { ClipGroup, Keyframe } from "~/pages/PageEnigma/models";
import { TrackKeyFrame } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrame";

interface Props {
  id: string;
  keyframes: Keyframe[];
  title: string;
  group: ClipGroup;
  toggleMute?: () => void;
  muted?: boolean;
  updateKeyframe: (options: {
    id: string;
    offset: number;
    force?: boolean;
    addToast: (type: "error" | "warning" | "success", message: string) => void;
  }) => void;
}

export const TrackKeyFrames = ({
  id,
  keyframes,
  updateKeyframe,
  title,
  group,
}: Props) => {
  return (
    <div>
      <div
        id={`track-${group}-${id}`}
        className={`relative mt-4 block h-9 w-full rounded-lg bg-${group}-unselected`}
      >
        {keyframes.map((keyframe) => (
          <TrackKeyFrame
            key={keyframe.keyframe_uuid}
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
