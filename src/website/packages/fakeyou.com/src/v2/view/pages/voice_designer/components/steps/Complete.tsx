import Button from "components/common/Button/Button";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck } from "@fortawesome/pro-solid-svg-icons";

function Complete() {
  return (
    <div className="d-flex flex-column align-items-center py-2 py-lg-5">
      <div className="d-flex flex-column align-items-center text-center">
        <div className="d-flex bg-success rounded-circle p-3 mb-3">
          <FontAwesomeIcon icon={faCheck} className="display-6 text-white" />
        </div>

        <h2 className="fw-bold mb-1">Voice successfully created!</h2>
        <h5 className="fw-normal opacity-75">"Test Voice Name"</h5>
      </div>

      <div className="d-flex gap-3 mt-4">
        <Button label="Use voice now" />
        <Button label="Create another" variant="secondary" />
      </div>
      <Button
        icon={faArrowRight}
        iconFlip={true}
        label="View all my voices"
        variant="link"
        className="mt-3"
      />
    </div>
  );
}
export { Complete };
