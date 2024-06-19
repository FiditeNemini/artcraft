import React, { useState } from "react";
import { Widget } from "@typeform/embed-react";

interface EmailSignUpProps {
  mobile?: boolean;
}

export default function EmailSignUp({ mobile }: EmailSignUpProps) {
  const [isHanashiHovered, setIsHanashiHovered] = useState(false);

  return (
    <div>
      <h1 className="text-center mb-5 fw-bold display-5">
        Join the waitlist today!
      </h1>
      <div
        style={{
          paddingTop: mobile ? "0px" : "60px",
          backgroundColor: "#242433",
          borderRadius: "1rem",
          borderTop: "3px solid #e66462",
          position: "relative",
        }}
      >
        {!mobile && (
          <img
            src={
              isHanashiHovered
                ? "/images/landing/hanashi-demo-2.webp"
                : "/images/landing/hanashi-demo-1.webp"
            }
            alt="Hanashi Demo"
            onMouseEnter={() => setIsHanashiHovered(true)}
            onMouseLeave={() => setIsHanashiHovered(false)}
            draggable="false"
            style={{
              top: "-49%",
              right: "3%",
              width: "390px",
              position: "absolute",
            }}
            className="d-none d-xxl-block"
          />
        )}

        <Widget id="TKSc5ImN" style={{ width: "100%", height: "300px" }} />
      </div>
    </div>
  );
}
