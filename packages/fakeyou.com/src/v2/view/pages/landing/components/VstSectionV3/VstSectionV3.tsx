import { Button, Panel } from "components/common";
import React from "react";
import "./VstSectionV3.scss";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";

interface VstSectionV3Props {}

export default function VstSectionV3(props: VstSectionV3Props) {
  return (
    <Panel className="mt-5">
      <div
        className="d-flex gap-0"
        style={{
          marginTop: "22px",
          marginLeft: "22px",
          marginRight: "22px",
          marginBottom: "16px",
        }}
      >
        <div className="flex-grow-1 text-nowrap">
          <h5 className="mb-0 fw-bold d-block d-md-none">
            Video Style Transfer
          </h5>
          <h2 className="mb-0 fw-bold d-none d-md-block">
            Video Style Transfer
          </h2>
          <p className="opacity-75">Turn your video into any style</p>
        </div>
        <div className="ms-3" style={{ width: "126px" }}>
          <Button
            icon={faArrowRight}
            iconFlip={true}
            label="Style Video"
            to="/style-video"
            className="text-nowrap"
          />
        </div>
      </div>

      <div>
        <video
          preload="metadata"
          autoPlay={true}
          controls={false}
          muted={true}
          loop={true}
          playsInline={true}
          className="w-100 d-none d-md-block"
        >
          <source src="/videos/vst_banner_desktop.mp4" type="video/mp4" />
        </video>
        <video
          preload="metadata"
          autoPlay={true}
          controls={false}
          muted={true}
          loop={true}
          playsInline={true}
          className="w-100 d-block d-md-none px-3 pb-2"
        >
          <source src="/videos/vst_banner_mobile.mp4" type="video/mp4" />
        </video>
      </div>
    </Panel>
  );
}
