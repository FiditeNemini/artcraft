
import { AudioItemElement } from "./audioItemElement";
import { AssetFilterOption, AudioMediaItem } from "~/pages/PageEnigma/models";

interface Props {
  currentPage: number;
  pageSize: number;
  items: AudioMediaItem[];
}

export const AudioItemElements = ({
  currentPage,
  pageSize,
  items,
}: Props) => {

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {items
        .slice(currentPage*pageSize, (currentPage+1)*pageSize)
        .map((item) => (
          <AudioItemElement key={item.media_id} item={item} />
        ))
      }
    </div>
  );
};
