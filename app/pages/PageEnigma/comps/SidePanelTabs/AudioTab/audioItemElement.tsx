import { useCallback, useContext, useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { WaveformPlayer } from "~/components";
import { MediaItem } from "~/pages/PageEnigma/models";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import {
  canDrop,
  currPosition,
  dragItem,
  initPosition,
} from "~/pages/PageEnigma/store";

import { H5, H6, Pill } from "~/components";

function getGcsUrl(bucketRelativePath: string | undefined | null): string {
  let bucket = "vocodes-public";
  let path = bucketRelativePath;
  if (path !== undefined && path !== null && !path.startsWith("/")) {
    path = "/" + path;
  }
  return `https://storage.googleapis.com/${bucket}${path}`;
}

interface Props {
  item: MediaItem;
}

export const AudioItemElement = ({ item }: Props) => {
  useSignals();
  const { startDrag, endDrag } = useContext(TrackContext);

  const { initX, initY } = initPosition.value;

  useEffect(() => {
    const onPointerUp = () => {
      if (dragItem.value) {
        endDrag();
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (dragItem.value) {
        event.stopPropagation();
        event.preventDefault();
        const deltaX = event.pageX - initX;
        const deltaY = event.pageY - initY;
        currPosition.value = { currX: initX + deltaX, currY: initY + deltaY };
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onMouseMove);

    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onMouseMove);
    };
  }, [startDrag, endDrag, initX, initY]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        startDrag(item);
        currPosition.value = {
          currX: event.pageX,
          currY: event.pageY,
        };
        initPosition.value = {
          initX: event.pageX,
          initY: event.pageY,
        };
        canDrop.value = false;
      }
    },
    [item, startDrag],
  );

  return (
    <div
      className="relative w-full cursor-pointer rounded-lg transition-all duration-200"
      onPointerDown={onPointerDown}>
      <div className="flex w-full flex-col gap-0.5 rounded-lg bg-assets-background p-2.5">
        <div className="flex justify-between">
          <Pill>Audio</Pill>
        </div>

        {item.publicBucketPath && (
          <WaveformPlayer audio={getGcsUrl(item.publicBucketPath)} />
        )}

        <H5 className="text-overflow-ellipsis">{item.name}</H5>
        {item.description && (
          <H6 className="text-overflow-ellipsis text-xs text-white/90">
            {item.description}
          </H6>
        )}
      </div>
    </div>
  );
};
