import { Panel } from "components/common";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Swiper as SwiperType } from "swiper/types";
import "./SdBatchMediaPanel.scss";

interface SdCoverImagePanelProps {
  images: string[];
}

export default function SdBatchMediaPanel({ images }: SdCoverImagePanelProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    images.forEach(imgSrc => {
      const img = new Image();
      img.onload = () => {
        // If any image is portrait, update isPortrait to true
        if (img.height > img.width && !isPortrait) {
          setIsPortrait(true);
        }
      };
      img.src = imgSrc;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  useEffect(() => {
    if (images.length > 0) {
      // Force re-render of the Swiper component by updating a key
      setForceUpdateKey(prevKey => prevKey + 1);
    }
  }, [images]);

  const handleSwiper = (swiper: SwiperType) => {
    setThumbsSwiper(swiper);
  };

  const secondSwiperClass = `secondSwiper ${
    isPortrait ? "portrait" : "landscape"
  }`;

  return (
    <Panel padding={false} clear className="d-flex flex-column gap-3">
      <Swiper
        key={forceUpdateKey}
        loop={images.length > 1}
        spaceBetween={10}
        navigation={images.length > 1}
        thumbs={{ swiper: images.length > 1 ? thumbsSwiper : null }}
        modules={[FreeMode, Navigation, Thumbs]}
        className={secondSwiperClass}
        slidesPerView={1}
        initialSlide={0}
      >
        {images.map((imgSrc, index) => (
          <SwiperSlide key={index}>
            <img src={imgSrc} alt={`Slide ${index + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>
      {images.length > 1 && (
        <Swiper
          onSwiper={handleSwiper}
          loop={true}
          spaceBetween={10}
          slidesPerView={5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="firstSwiper"
          initialSlide={0}
        >
          {images.map((imgSrc, index) => (
            <SwiperSlide key={index}>
              <img src={imgSrc} alt={`Thumbnail ${index + 1}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Panel>
  );
}
