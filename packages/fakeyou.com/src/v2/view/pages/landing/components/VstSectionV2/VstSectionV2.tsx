import { Badge, Button, Panel } from "components/common";
import React, { useState } from "react";
import "./VstSectionV2.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper as SwiperType } from "swiper/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faArrowDownLong,
  faArrowRight,
  faArrowRightLong,
} from "@fortawesome/pro-solid-svg-icons";
// import TypeformButton from "components/common/TypeformButton";
// import { Link } from "react-router-dom";

interface VstSectionV2Props {}

export default function VstSectionV2(props: VstSectionV2Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // const [isPlaying, setIsPlaying] = useState(true);

  // const togglePlayback = () => {
  //   setIsPlaying(!isPlaying);
  // };

  // const handleVideoPlay = () => {
  //   if (!isPlaying) {
  //     setIsPlaying(true);
  //   }
  // };

  // const handleVideoPause = () => {
  //   if (isPlaying) {
  //     setIsPlaying(false);
  //   }
  // };

  // const videoRef = useRef<HTMLVideoElement | null>(null);

  // useEffect(() => {
  //   if (videoRef.current) {
  //     if (isPlaying) {
  //       videoRef.current.play();
  //     } else {
  //       videoRef.current.pause();
  //     }
  //   }
  // }, [isPlaying]);

  const videoSet = [
    {
      src: "/videos/landing/vst/1-original.mp4",
      thumbnail: "/videos/landing/vst/1-original.jpg",
      styledVideos: [
        {
          src: "/videos/landing/vst/1-2d_flat_anime.mp4",
          label: "2D Flat Anime",
          ctaLink: "/style-video",
        },
        {
          src: "/videos/landing/vst/1-3d_cartoon.mp4",
          label: "3D Cartoon",
          ctaLink: "/style-video",
        },
        {
          src: "/videos/landing/vst/1-ink_bw.mp4",
          label: "Ink B&W",
          ctaLink: "/style-video",
        },
        {
          src: "/videos/landing/vst/1-origami.mp4",
          label: "Origami",
          ctaLink: "/style-video",
        },
      ],
    },
    {
      src: "/videos/landing/vst/2-original.mp4",
      thumbnail: "/videos/landing/vst/2-original.jpg",
      styledVideos: [
        {
          src: "/videos/landing/vst/2-2d_flat_anime.mp4",
          label: "2D Flat Anime",
          ctaLink: "/style-video",
        },
        {
          src: "/videos/landing/vst/2-pop_art.mp4",
          label: "Pop Art",
          ctaLink: "/style-video",
        },
        {
          src: "/videos/landing/vst/2-ink_splash.mp4",
          label: "Ink Splash",
          ctaLink: "/style-video",
        },
        {
          src: "/videos/landing/vst/2-origami.mp4",
          label: "Origami",
          ctaLink: "/style-video",
        },
      ],
    },
  ];

  const [currentStyledVideos, setCurrentStyledVideos] = useState(
    videoSet[0].styledVideos
  );

  return (
    <Panel clear={true} className="vst-section">
      <div className="col-12 col-lg-6 mb-5 mb-lg-3 pb-lg-3">
        <h1 className="fw-bold">Video Style Transfer</h1>
        <p className="opacity-75 mb-4">
          Transform your videos effortlessly with video style transfer. Apply
          unique styles and effects to create visually captivating content.
        </p>
        <div className="d-flex">
          <Button
            to="/style-video"
            label="Stylize a Video"
            iconFlip={true}
            icon={faArrowRight}
          />
          {/* <TypeformButton
            label="Join the Waitlist"
            formId="oWnV91Z9"
            labelSubmitted="You're on the waitlist!"
          /> */}
        </div>
      </div>
      <div className="row gx-0">
        <div className="col-12 col-lg-4 d-flex gap-3 justify-content-center flex-column-reverse flex-lg-column">
          <Swiper
            loop={false}
            spaceBetween={10}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Navigation, Thumbs]}
            className="vst-swiper-main"
            onSlideChange={(swiper: SwiperType) => {
              setCurrentStyledVideos(videoSet[swiper.activeIndex].styledVideos);
              setActiveIndex(swiper.activeIndex);
            }}
          >
            <div className="vst-swiper-main-overlay-text">
              <Badge label="Original Video" color="gray" />
            </div>
            {videoSet.map((video, index) => (
              <SwiperSlide key={index}>
                <div className="ratio ratio-16x9 vst-carousel-panel">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    preload="auto"
                    key={`${index}-${activeIndex}`}
                    // onPlay={handleVideoPlay}
                    // onPause={handleVideoPause}
                    // ref={videoRef => {
                    //   if (videoRef && isPlaying) {
                    //     videoRef.play();
                    //   } else if (videoRef) {
                    //     videoRef.pause();
                    //   }
                    // }}
                  >
                    <source src={video.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <Swiper
            onSwiper={(swiper: SwiperType) => setThumbsSwiper(swiper)}
            loop={false}
            spaceBetween={10}
            slidesPerView={3}
            modules={[Navigation, Thumbs]}
            className="vst-swiper-thumbs"
          >
            {videoSet.map((video, index) => (
              <SwiperSlide key={index}>
                <div className="ratio ratio-16x9 vst-carousel-panel">
                  <img
                    src={video.thumbnail}
                    alt="Demo Original Video Thumbnail"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="col-12 col-lg-1 p-3 p-lg-0 d-flex align-items-center justify-content-center">
          <FontAwesomeIcon
            icon={faArrowRightLong}
            className="display-5 opacity-75 d-none d-lg-block"
          />
          <FontAwesomeIcon
            icon={faArrowDownLong}
            className="display-5 opacity-75 d-block d-lg-none"
          />
        </div>
        <div className="col-12 col-lg-7">
          <div className="vst-styled-videos-panel d-flex flex-wrap">
            {currentStyledVideos.map((styledVideo, index) => (
              <div
                key={`${index}-${styledVideo.src}`}
                className="ratio ratio-16x9 w-50"
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  preload="auto"
                  key={styledVideo.src}
                  // onPlay={handleVideoPlay}
                  // onPause={handleVideoPause}
                  // ref={videoRef => {
                  //   if (videoRef && isPlaying) {
                  //     videoRef.play();
                  //   } else if (videoRef) {
                  //     videoRef.pause();
                  //   }
                  // }}
                >
                  <source src={styledVideo.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="vst-styled-videos-panel-overlay-text">
                  <Badge label={styledVideo.label} color="gray" />
                </div>
                {/* <div className="vst-styled-videos-panel-overlay-cta">
                  <Link to={styledVideo.ctaLink || "/style-video"}>
                    <Badge label="Try this style" />
                  </Link>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
