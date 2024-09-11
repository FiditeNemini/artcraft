import { useEffect, useState } from "react";

export function LabelTimeDuration({ vidEl }: { vidEl: HTMLVideoElement }) {
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    const handleTimeStamp = () => setCurrentTime(vidEl.currentTime || 0);

    vidEl.addEventListener("timeupdate", handleTimeStamp);
    return () => {
      vidEl.removeEventListener("timeupdate", handleTimeStamp);
    };
  }, [vidEl]);

  return (
    <div className="flex items-center gap-1">
      <p className="w-12">{`${formatSecondsToHHMMSSCS(currentTime)}`}</p>
      <span>/</span>
      <p className="w-12">{`${formatSecondsToHHMMSSCS(vidEl.duration)}`}</p>
    </div>
  );
}
function formatSecondsToHHMMSSCS(seconds: number) {
  //example of the ISO String: 1970-01-01T00:01:40.774Z
  const isoString = new Date(seconds * 1000).toISOString();
  if (seconds > 3600)
    return isoString.substring(11, 19) + "." + isoString.substring(20, 22);
  else return isoString.substring(14, 19) + "." + isoString.substring(20, 22);
}
