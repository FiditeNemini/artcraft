import { useEffect, useRef, useState } from "react";
import { ItemElement } from "./ItemElement";
import { AssetFilterOption, MediaItem } from "~/pages/PageEnigma/models";

interface Props {
  items: MediaItem[];
  assetFilter: AssetFilterOption;
}

export const ItemElements = ({ items, assetFilter }: Props) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateContainerWidth = () => {
      const width = containerRef.current?.clientWidth || 0;
      setContainerWidth(width);
    };

    updateContainerWidth();

    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const displayItems = items.filter((item) => {
    if (assetFilter === AssetFilterOption.ALL) {
      return true;
    }
    if (assetFilter === AssetFilterOption.MINE) {
      return item.isMine;
    }
    return item.isBookmarked;
  });

  let gridColumnsClass = "grid-cols-4";
  if (containerWidth <= 200) {
    gridColumnsClass = "grid-cols-2";
  } else if (containerWidth <= 300) {
    gridColumnsClass = "grid-cols-3";
  } else if (containerWidth <= 400) {
    gridColumnsClass = "grid-cols-4";
  }

  return (
    <div ref={containerRef} className={`grid ${gridColumnsClass} gap-3`}>
      {displayItems.map((item) => (
        <ItemElement key={item.media_id} item={item} />
      ))}
    </div>
  );
};
