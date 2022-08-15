import React, { useState, useCallback, useEffect } from "react";

interface Props {
  filename: string;
  title: string;
}

function AudioSampleButton(props: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(false);
  });

  return (
    <>
      <button onClick={handleTogglePlay}></button>
      <Wavesurfer />
    </>
  );
}
