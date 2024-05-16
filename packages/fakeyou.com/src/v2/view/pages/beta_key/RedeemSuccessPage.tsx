import { Button, Container } from "components/common";
import React from "react";
import "./BetaKey.scss";

export default function RedeemSuccessPage() {
  const handleEnterStudio = () => {
    window.location.href = "https://studio.storyteller.ai";
  };

  return (
    <>
      <Container type="panel" className="redeem-container">
        <div className="d-flex flex-column align-items-center justify-content-center vh-100">
          <div className="px-4 d-flex flex-column align-items-center">
            <img
              src="/mascot/kitsune_pose7.webp"
              alt="Success Mascot"
              style={{ maxWidth: "100%" }}
            />
            <div className="d-flex flex-column align-items-center">
              <h2 className="fw-bold mb-1">Redemption Success</h2>
              <p className="opacity-75 text-center fs-5">
                You now have access to Storyteller Studio Beta!
              </p>
            </div>
          </div>

          <div className="d-flex flex-column align-items-center">
            <Button
              label="Enter Studio"
              className="redeem-button mt-4"
              onClick={handleEnterStudio}
            />
          </div>
        </div>
      </Container>
    </>
  );
}
