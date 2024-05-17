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
      className="relative w-full cursor-pointer rounded-xl bg-[#A0A0A0] transition-all duration-200"
      onPointerDown={(event) => DndAsset.onPointerDown(event, item)}
    >
      <img
        src={thumbnail}
        onError={(e: SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src = defaultThumb;
        }}
        alt={item.name}
        className="aspect-[4.5/5] w-full rounded-t-lg object-cover object-center"
      />
      <div
        className="text-overflow-ellipsis w-full rounded-b-lg px-2 py-1.5 text-center text-sm"
        style={{ backgroundColor: "#39394D" }}
      >
        {item.name || item.media_id}
      </div>
    </div>
  );
};
