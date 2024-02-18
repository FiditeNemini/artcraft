import { Panel } from "components/common";
import React, { useState } from "react";
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

  const handleSwiper = (swiper: SwiperType) => {
    setThumbsSwiper(swiper);
  };

  return (
    <Panel padding={true}>
      <Swiper
        loop={true}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="secondSwiper"
        slidesPerView={1}
      >
        {images.map((imgSrc, index) => (
          <SwiperSlide key={index}>
            <div className="media-img-container">
              <img src={imgSrc} alt={`Slide ${index + 1}`} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        onSwiper={handleSwiper}
        loop={true}
        spaceBetween={10}
        slidesPerView={5}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="firstSwiper"
      >
        {images.map((imgSrc, index) => (
          <SwiperSlide key={index}>
            <img src={imgSrc} alt={`Thumbnail ${index + 1}`} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Panel>
  );
}
