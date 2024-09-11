import { useEffect, useState } from "react";

import { faPlay, faPause } from "@fortawesome/pro-solid-svg-icons";

import { Button } from "~/components/ui";

export function ButtonPlaypause({ vidEl }: { vidEl: HTMLVideoElement }) {
  const [playpause, setPlayPause] = useState<"playing" | "paused">("paused");
  const togglePlaypause = () => {
    if (playpause === "playing") {
      vidEl.pause();
    } else {
      vidEl.play();
    }
  };

  useEffect(() => {
    const setPlaying = () => setPlayPause("playing");
    const setPaused = () => setPlayPause("paused");

    vidEl.addEventListener("play", setPlaying);
    vidEl.addEventListener("pause", setPaused);

    return () => {
      vidEl.removeEventListener("play", setPlaying);
      vidEl.removeEventListener("pause", setPaused);
    };
  }, [vidEl]);

  return (
    <Button
      className="w-10"
      icon={playpause === "playing" ? faPause : faPlay}
      variant={playpause === "playing" ? "secondary" : "primary"}
      onClick={togglePlaypause}
    />
  );
}
