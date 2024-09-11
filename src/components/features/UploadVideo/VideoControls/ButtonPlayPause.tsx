import { useEffect, useState } from "react";

import { faPlay, faPause, faStop } from "@fortawesome/pro-solid-svg-icons";

import { Button } from "~/components/ui";
enum PlayPauseStatus {
  PLAYING = "play",
  PAUSED = "pause",
  ENDED = "ended",
}
export function ButtonPlaypause({ vidEl }: { vidEl: HTMLVideoElement }) {
  const [playpause, setPlayPause] = useState<PlayPauseStatus>(
    PlayPauseStatus.PAUSED,
  );
  const togglePlaypause = () => {
    if (playpause === PlayPauseStatus.PLAYING) {
      vidEl.pause();
    } else {
      vidEl.play();
    }
  };

  const getIcon = () => {
    if (playpause === PlayPauseStatus.PLAYING) {
      return faPause;
    } else if (playpause === PlayPauseStatus.PAUSED) {
      return faPlay;
    } else {
      return faStop;
    }
  };

  useEffect(() => {
    const setPlaying = () => setPlayPause(PlayPauseStatus.PLAYING);
    const setPaused = () => setPlayPause(PlayPauseStatus.PAUSED);
    const setEnded = () => setPlayPause(PlayPauseStatus.ENDED);

    vidEl.addEventListener(PlayPauseStatus.PLAYING, setPlaying);
    vidEl.addEventListener(PlayPauseStatus.PAUSED, setPaused);
    vidEl.addEventListener(PlayPauseStatus.ENDED, setEnded);

    return () => {
      vidEl.removeEventListener(PlayPauseStatus.PLAYING, setPlaying);
      vidEl.removeEventListener(PlayPauseStatus.PAUSED, setPaused);
      vidEl.removeEventListener(PlayPauseStatus.ENDED, setEnded);
    };
  }, [vidEl]);

  return (
    <Button
      className="w-10"
      icon={getIcon()}
      variant={playpause === PlayPauseStatus.PLAYING ? "secondary" : "primary"}
      onClick={togglePlaypause}
    />
  );
}
