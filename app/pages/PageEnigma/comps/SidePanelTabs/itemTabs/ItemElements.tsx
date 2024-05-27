import { ItemElement } from "./ItemElement";
import { MediaItem } from "~/pages/PageEnigma/models";
import { dndSidePanelWidth, sidePanelWidth } from "~/pages/PageEnigma/signals";
import { LoadingDots } from "~/components";
import { AssetFilterOption } from "~/enums";

interface Props {
  busy?: boolean;
  className?: string;
  debug?: string;
  items: MediaItem[];
  assetFilter: AssetFilterOption;
}

export const ItemElements = ({
  busy,
  className,
  debug,
  items,
  assetFilter,
}: Props) => {
  const displayWidth =
    dndSidePanelWidth.value > -1
      ? dndSidePanelWidth.value
      : sidePanelWidth.value;

  const displayItems = items.filter((item) => {
    if (assetFilter === AssetFilterOption.ALL) {
      return true;
    }
    if (assetFilter === AssetFilterOption.MINE) {
      return item.isMine;
    }
    return item.isBookmarked;
  });

  function getGridColumnsClass(displayWidth: number): string {
    if (displayWidth <= 280) {
      return "grid-cols-2";
    } else if (displayWidth <= 360) {
      return "grid-cols-3";
    } else if (displayWidth <= 440) {
      return "grid-cols-4";
    } else {
      return "grid-cols-4";
    }
  }

  const gridColumnsClass = getGridColumnsClass(displayWidth);

  return busy ? (
    <div className="flex h-full w-full">
      <LoadingDots className="bg-transparent" />
    </div>
  ) : (
    <div
      className={`grid ${gridColumnsClass} gap-2.5 ${className ? " " + className : ""}`}
    >
      {displayItems.map((item) => (
        <ItemElement debug={debug} key={item.media_id} item={item} />
      ))}
    </div>
  );
};
