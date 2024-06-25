import { faArrowLeft, faCircleCheck } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetWebsiteLink } from "@storyteller/components/src/env/GetWebsiteLink";
import { Button, Container, SocialButton } from "components/common";
import React, { useEffect, useState } from "react";

export default function WaitlistSuccessPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const sharePath = "/";
  const shareUrl = GetWebsiteLink(sharePath);
  const shareText =
    "I just joined the waitlist for Storyteller Studio! Check out their site and join me in discovering the future of digital storytelling. 🌟";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Container
      type="panel"
      className="vh-100 d-flex flex-column justify-content-center align-items-center"
    >
      <img
        src="/fakeyou/Storyteller-Logo-1.png"
        alt="Storyteller Logo"
        style={{ maxWidth: "280px" }}
        className="mb-4"
      />
      <div
        style={{
          backgroundColor: "#242433",
          borderRadius: "1rem",
          borderTop: "3px solid #e66462",
          maxWidth: "635px",
          paddingLeft: isMobile ? "1.5rem" : "3rem",
          paddingRight: isMobile ? "1.5rem" : "3rem",
        }}
        className="text-center d-flex flex-column gap-4 align-items-center py-5"
      >
        <h2 className="fw-bold mt-3">
          <FontAwesomeIcon icon={faCircleCheck} className="me-3" />
          You're on the waitlist!
        </h2>
        <div>
          <p className="fw-semibold lead text-white mb-1 fs-5">
            Thank you for your interest in Storyteller Studio.
          </p>
          <p>
            We're thrilled to have you on board and can't wait to share more
            with you.
          </p>
        </div>
        <p>
          We're currently reaching out to creators like you! You'll receive an
          email from us with more information on how to get started.
        </p>
        <p>
          Meanwhile, please share us on social media and help us spread the
          word!
        </p>
        <div className="d-flex flex-wrap gap-3 gap-lg-4 my-1 justify-content-between">
          <SocialButton social="x" shareUrl={shareUrl} shareText={shareText} />
          <SocialButton
            social="reddit"
            shareUrl={shareUrl}
            shareText={shareText}
          />
          <SocialButton
            social="facebook"
            shareUrl={shareUrl}
            shareText={shareText}
          />
          <SocialButton
            social="whatsapp"
            shareUrl={shareUrl}
            shareText={shareText}
          />
          <SocialButton
            social="email"
            shareUrl={shareUrl}
            shareText={shareText}
          />
        </div>
        <p>
          If you have any questions, feel free to reach out to us at{" "}
          <a href="mailto:support@storyteller.ai" style={{ color: "#e66462" }}>
            support@storyteller.ai
          </a>
        </p>
        <div className="d-flex justify-content-center my-3">
          <Button icon={faArrowLeft} to="/" label="Back to Homepage" />
        </div>
      </div>
    </Container>
  );
}
