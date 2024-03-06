import { Badge, Panel } from "components/common";
import React from "react";
import "./VstSectionV1.scss";

interface VstSectionV1Props {}

const columns = [
  {
    title: "Original Video",
    videoSrc: "videos/face-animator-instruction-en.mp4",
  },
  { title: "Anime Style", videoSrc: "videos/face-animator-instruction-en.mp4" },
  { title: "Pixel Style", videoSrc: "videos/face-animator-instruction-en.mp4" },
  { title: "Ink Style", videoSrc: "videos/face-animator-instruction-en.mp4" },
];

export default function VstSectionV1(props: VstSectionV1Props) {
  return (
    <Panel clear={true} className="pb-5">
      <div className="mb-5">
        <h1 className="fw-bold">Video Style Transfer</h1>
        <p>
          Transform your videos effortlessly with video style transfer. Apply
          unique styles and effects to create visually captivating content.
        </p>
      </div>

      <div className="row g-0">
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
