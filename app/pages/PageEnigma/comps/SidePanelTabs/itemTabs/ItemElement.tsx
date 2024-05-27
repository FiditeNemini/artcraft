import { MediaItem } from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import DndAsset from "~/pages/PageEnigma/DragAndDrop/DndAsset";
import { SyntheticEvent } from "react";

interface Props {
  debug?: string;
  item: MediaItem;
}

export const ItemElement = ({ item }: Props) => {
  useSignals();
  const defaultThumb = `/resources/images/default-covers/${item.imageIndex || 0}.webp`;
  const thumbnail = item.thumbnail ? item.thumbnail : defaultThumb;

  return (
    <div
      className="group relative w-full cursor-pointer select-none overflow-hidden rounded-lg transition-all duration-200 hover:brightness-110"
      onPointerDown={(event) => DndAsset.onPointerDown(event, item)}
    >
      <img
        src={thumbnail}
        onError={(e: SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src = defaultThumb;
        }}
        alt={item.name}
        className="pointer-events-none aspect-[4.5/5] w-full select-none bg-[#A0A0A0] object-cover object-center"
      />
      <div className="pointer-events-none w-full select-none truncate bg-ui-controls px-2 py-1 text-center text-[13px] transition-all duration-200 group-hover:bg-ui-controls-button/50">
        {item.name || item.media_id}
      </div>
    </div>
  );
};
