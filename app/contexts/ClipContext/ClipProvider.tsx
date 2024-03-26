import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ClipContext } from "./ClipContext";
import { AnimationClip, AudioClip } from "~/models/track";

interface Props {
  children: ReactNode;
}

export const ClipProvider = ({ children }: Props) => {
  const [state, setState] = useState<{
    dragType: "animations" | "lipSync" | null;
    dragId: string | null;
  }>({ dragType: null, dragId: null });
  const [animationClips, setAnimationClips] = useState<AnimationClip[]>([]);
  const [audioClips, setAudioClips] = useState<AudioClip[]>([]);

  useEffect(() => {
    console.log("eff");
    setAnimationClips([
      {
        id: "ani-id1",
        offset: 0,
        length: 124,
        name: "ani 11",
      },
    ]);
    setAudioClips([]);
  }, []);

  const startDrag = useCallback(
    (type: "animations" | "lipSync", id: string) => {
      setState({ dragId: id, dragType: type });
    },
    [],
  );

  const endDrag = useCallback(() => {
    setState({ dragId: null, dragType: null });
  }, []);

  const [time, setTime] = useState(0);
  const updateCurrentTime = useCallback((newTime: number) => {
    setTime(newTime);
  }, []);

  const [canDrop, setCanDrop] = useState(false);

  const values = useMemo(() => {
    return {
      dragType: state.dragType,
      dragId: state.dragId,
      animationClips,
      audioClips,
      startDrag,
      endDrag,
      scale: 1,
      currentTime: time,
      length: 12,
      updateCurrentTime,
      canDrop,
      setCanDrop,
    };
  }, [
    state.dragId,
    state.dragType,
    animationClips,
    audioClips,
    startDrag,
    endDrag,
    canDrop,
    updateCurrentTime,
    setCanDrop,
    time,
  ]);

  return <ClipContext.Provider value={values}>{children}</ClipContext.Provider>;
};
