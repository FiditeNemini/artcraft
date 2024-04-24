import { AudioItemElement } from "./audioItemElement";
import { AssetFilterOption, MediaItem } from "~/pages/PageEnigma/models";

interface Props {
  items: MediaItem[];
  assetFilter: AssetFilterOption;
}

export const AudioItemElements = ({ items, assetFilter }: Props) => {
  const displayItems = items.filter((item) => {
    if (assetFilter === AssetFilterOption.ALL) {
      return true;
    }
    if (assetFilter === AssetFilterOption.MINE) {
      return item.isMine;
    }
    return item.isBookmarked;
  });

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {displayItems.map((item) => (
        <AudioItemElement key={item.media_id} item={item} />
      ))}
    </div>
  );
};
