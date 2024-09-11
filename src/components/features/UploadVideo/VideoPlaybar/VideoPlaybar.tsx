import { twMerge } from "tailwind-merge";
import { VIDEO_STATE_STATUSES } from "./enum";

import { ButtonPlaypause } from "./ButtonPlayPause";
// import { ButtonRepeat } from "./ButtonRepeat";
import { ButtonMute } from "./ButtonMute";
import { LabelTimeDuration } from "./LabelTimeDuration";
// import { SelectTrim } from "./SelectTrims";
import { Spinner } from "~/components/ui";

export const VideoPlaybar = ({
  status,
  vidEl,
}: {
  status: VIDEO_STATE_STATUSES;
  vidEl?: HTMLVideoElement;
}) => {
  const wrapperClass =
    "flex w-full h-10 justify-center items-center gap-2 bg-gray-100";

  if (status === VIDEO_STATE_STATUSES.METADATA_LOADED && vidEl) {
    return (
      <div className={wrapperClass}>
        <ButtonPlaypause vidEl={vidEl} />
        <ButtonMute vidEl={vidEl} />
        <LabelTimeDuration vidEl={vidEl} />
        <div className="grow"></div>
      </div>
    );
  }
  return (
    <div className={wrapperClass}>
      <Spinner className="size-5" />
      <span>Loading...</span>
    </div>
  );
};
