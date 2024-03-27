import { useCallback, useState } from "react";

export default function useUpdateDragDrop() {
  const [state, setState] = useState<{
    dragType: "animations" | "lipSync" | null;
    dragId: string | null;
  }>({ dragType: null, dragId: null });
  const startDrag = useCallback(
    (type: "animations" | "lipSync", id: string) => {
      setState({ dragId: id, dragType: type });
    },
    [],
  );
  const [canDrop, setCanDrop] = useState(false);
  const [overTimeline, setOverTimeline] = useState(false);

  const endDrag = useCallback(() => {
    setState({ dragId: null, dragType: null });
  }, []);

  const [dropId, setDropId] = useState("");
  const [dropOffset, setDropOffset] = useState(0);

  return {
    dragId: state.dragId,
    dragType: state.dragType,
    startDrag,
    endDrag,
    canDrop,
    setCanDrop,
    overTimeline,
    setOverTimeline,
    dropId,
    setDropId,
    dropOffset,
    setDropOffset,
  };
}
