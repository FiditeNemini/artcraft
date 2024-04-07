import { ItemElement } from "./ItemElement";
import { AssetFilterOption, MediaItem } from "~/pages/PageEnigma/models";

interface Props {
  items: MediaItem[];
  assetFilter: AssetFilterOption;
}

export const ItemElements = ({ items, assetFilter }: Props) => {
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
    <div className="flex flex-wrap gap-3">
      {displayItems.map((item) => (
        <ItemElement key={item.media_id} item={item} />
      ))}
    </div>
  );
};
