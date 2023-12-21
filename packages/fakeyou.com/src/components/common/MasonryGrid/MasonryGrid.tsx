import Masonry from "masonry-layout"; //Refer to: https://github.com/desandro/masonry
import imagesLoaded from "imagesloaded"; //Refer to: https://github.com/desandro/imagesloaded
import React, { useEffect } from "react";

interface MasonryGridProps {
  children: React.ReactNode;
  onLayoutComplete?: () => void;
  gridRef: React.RefObject<HTMLDivElement>;
}

export default function MasonryGrid({
  children,
  onLayoutComplete,
  gridRef,
}: MasonryGridProps) {
  useEffect(() => {
    let masonryInstance: Masonry | null = null;

    const updateLayout = () => {
      //Needs this type guard to check that it is not undefined.
      if (masonryInstance && typeof masonryInstance.layout === "function") {
        masonryInstance.layout();
      }
    };

    if (gridRef.current) {
      masonryInstance = new Masonry(gridRef.current, {
        itemSelector: ".grid-item",
        percentPosition: true,
        transitionDuration: 0,
      });

      //Needs this or images will overflow masonry card. It checks if image is loaded then after it is loaded, it resizes the card.
      imagesLoaded(gridRef.current, function () {
        updateLayout();
        onLayoutComplete?.();
      });
    }

    //Clean up
    return () => {
      if (masonryInstance && typeof masonryInstance.destroy === "function") {
        masonryInstance.destroy();
      }
    };
  }, [gridRef, onLayoutComplete]);

  return (
    <div
      ref={gridRef}
      className="row gy-3 gx-3"
      data-masonry='{"percentPosition": true}'
    >
      {children}
    </div>
  );
}
