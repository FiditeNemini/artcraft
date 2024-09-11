import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import { VIDEO_STATE_STATUSES } from "./enum";
import { ButtonPlaypause } from "./ButtonPlayPause";
import { ButtonMute } from "./ButtonMute";
import { LabelTimeDuration } from "./LabelTimeDuration";
import { Spinner } from "~/components/ui";

export const VideoControls = ({
  vidEl,
  className,
}: {
  vidEl: HTMLVideoElement | undefined;
  className?: string;
}) => {
  const [status, setStatus] = useState<VIDEO_STATE_STATUSES>(
    VIDEO_STATE_STATUSES.INIT,
  );

  useEffect(() => {
    const handleLoadedmetadata = () => {
      if (vidEl) {
        setStatus(VIDEO_STATE_STATUSES.METADATA_LOADED);
      }
    };

    // DOM node referencs has changed and exists
    if (vidEl) {
      vidEl.addEventListener("loadedmetadata", handleLoadedmetadata);
    }
    return () => {
      vidEl?.removeEventListener("loadedmetadata", handleLoadedmetadata);
    };
  }, [vidEl]);

  const wrapperClass = twMerge(
    "flex w-full h-10 justify-center items-center gap-2",
    className,
  );

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
