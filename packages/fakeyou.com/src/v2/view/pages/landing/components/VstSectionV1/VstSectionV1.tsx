import { Badge, Button, Panel } from "components/common";
import React, { useEffect, useRef, useState } from "react";
import "./VstSectionV1.scss";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
// import { Link } from "react-router-dom";

interface VstSectionV1Props {}

const columns = [
  {
    title: "Original Video",
    videoSrc: "/videos/landing/vst/1-original.mp4",
    ctaLink: "/style-video",
  },
  {
    title: "2D Flat Anime",
    videoSrc: "/videos/landing/vst/1-2d_flat_anime.mp4",
    ctaLink: "/style-video",
  },
  {
    title: "Ink B&W",
    videoSrc: "/videos/landing/vst/1-ink_bw.mp4",
    ctaLink: "/style-video",
  },
  {
    title: "Origami",
    videoSrc: "/videos/landing/vst/1-origami.mp4",
    ctaLink: "/style-video",
  },
];

export default function VstSectionV1(props: VstSectionV1Props) {
  const videosRef = useRef<HTMLVideoElement[]>([]);
  const [loadedVideos, setLoadedVideos] = useState(0);

  useEffect(() => {
    const checkAllVideosLoaded = () => {
      setLoadedVideos(prevLoaded => prevLoaded + 1);
    };

    videosRef.current.forEach(video => {
      video.addEventListener("canplaythrough", checkAllVideosLoaded);
    });

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      videosRef.current.forEach(video => {
        video.removeEventListener("canplaythrough", checkAllVideosLoaded);
      });
    };
  }, []);

  useEffect(() => {
    if (loadedVideos === columns.length) {
      videosRef.current.forEach(video => video.play());
    }
  }, [loadedVideos]);

  return (
    <Panel clear={true} className="vst-section">
      <div className="col-12 col-lg-6 mb-5 pb-lg-3">
        <h1 className="fw-bold">Video Style Transfer</h1>
        <p className="opacity-75 mb-4">
          Transform your videos effortlessly with video style transfer. Apply
          unique styles and effects to create visually captivating content.
        </p>
        <div className="d-flex">
          <Button
            label="Try Video Style Transfer"
            small={true}
            icon={faArrowRight}
            iconFlip={true}
            to="/style-video"
          />
        </div>
      </div>

      <div className="row g-3 g-lg-4">
        {columns.map((column, index) => (
          <div className={`col-6 col-lg-3 column-${index + 1}`} key={index}>
            <div className="vst-sbs-panel">
              <div className="vst-sbs-video-overlay-container">
                <video className="vst-sbs-video-cover" autoPlay loop muted>
                  <source src={column.videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="vst-sbs-video-overlay-text">
                  <Badge label={column.title} color="gray" />
                </div>
                {/* <div className="vst-sbs-video-overlay-cta">
                  <Link to={column.ctaLink || "/style-video"}>
                    <Badge label="Try this style" />
                  </Link>
                </div> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
