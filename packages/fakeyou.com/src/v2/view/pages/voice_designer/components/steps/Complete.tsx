import Button from "components/common/Button/Button";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck } from "@fortawesome/pro-solid-svg-icons";

function Complete() {
  return (
    <div className="d-flex flex-column align-items-center">
      <div className="d-flex flex-column align-items-center">
        <div className="d-flex bg-success rounded-circle p-3 mb-3">
          <FontAwesomeIcon icon={faCheck} className="display-6 text-white" />
        </div>

        <h1 className="fw-bold">Voice successfully created!</h1>
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
        className="mt-4"
      />
    </div>
  );
}
export { Complete };
