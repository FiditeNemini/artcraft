import Masonry from "masonry-layout"; //Refer to: https://github.com/desandro/masonry
import imagesLoaded from "imagesloaded"; //Refer to: https://github.com/desandro/imagesloaded
import React, { useEffect, useRef } from "react";

interface MasonryGridProps {
  children: React.ReactNode;
}

export default function MasonryGrid({ children }: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let masonryInstance: Masonry | null = null;

    if (gridRef.current) {
      masonryInstance = new Masonry(gridRef.current, {
        itemSelector: ".grid-item",
        percentPosition: true,
      });

      //Needs this or images will overflow masonry card. It checks if image is loaded then after it is loaded, it resizes the card.
      imagesLoaded(gridRef.current, function () {
        //Needs this type guard to check that it is not undefined.
        if (masonryInstance && typeof masonryInstance.layout === "function") {
          masonryInstance.layout();
        }
      });
    }

    //Clean up
    return () => {
      if (masonryInstance && typeof masonryInstance.destroy === "function") {
        masonryInstance.destroy();
      }
    };
  }, []);

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
